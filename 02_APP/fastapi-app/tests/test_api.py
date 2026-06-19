"""
Tests automatisés de l'API Smart Recycle — (C12 / C18)
Utilise pytest + httpx (client HTTP asynchrone compatible FastAPI).

Lancer les tests :
    pytest tests/test_api.py -v
"""

import io
import sys
import pytest
from unittest.mock import MagicMock, patch
from PIL import Image

# ── Mock du modèle YOLO avant tout import de l'app ──────────────────────────
# Permet aux tests de tourner sans GPU ni ultralytics installé (CI/CD)
mock_model_loader = MagicMock()
mock_model_loader.predict.return_value = [
    {
        "label": "PLASTIC",
        "confidence": 0.89,
        "box": [10.0, 20.0, 200.0, 300.0],
        "bin_color": "yellow",
        "advice": "Bouteilles et flacons en plastique. Poubelle jaune.",
    }
]

# On injecte le mock avant que main.py ne charge model_loader
sys.modules["app.model_loader"] = MagicMock(model_loader=mock_model_loader)

from fastapi.testclient import TestClient
from app.main import app  # Import APRÈS le mock

client = TestClient(app)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def make_fake_image_bytes(color=(0, 255, 0), size=(100, 100)) -> bytes:
    """Génère une image PNG synthétique en mémoire pour les tests."""
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.read()


# ─── Tests ────────────────────────────────────────────────────────────────────

class TestHealthCheck:
    """C12.1 — L'API doit répondre 200 OK sur la route racine"""

    def test_root_returns_200(self):
        response = client.get("/")
        assert response.status_code == 200

    def test_root_returns_expected_message(self):
        response = client.get("/")
        body = response.json()
        assert "message" in body
        assert "running" in body["message"].lower()


class TestClassifyEndpoint:
    """C12.2 — L'endpoint /classify doit accepter une image et retourner le bon format"""

    def test_classify_returns_200_with_valid_image(self):
        image_bytes = make_fake_image_bytes()
        response = client.post(
            "/classify",
            files={"file": ("test_image.png", image_bytes, "image/png")},
        )
        assert response.status_code == 200

    def test_classify_response_has_required_fields(self):
        image_bytes = make_fake_image_bytes()
        response = client.post(
            "/classify",
            files={"file": ("test_image.png", image_bytes, "image/png")},
        )
        body = response.json()
        assert "detections" in body, "Le champ 'detections' est absent"
        assert "total_objects_detected" in body, "Le champ 'total_objects_detected' est absent"
        assert "filename" in body, "Le champ 'filename' est absent"

    def test_classify_total_objects_matches_detections_length(self):
        image_bytes = make_fake_image_bytes()
        response = client.post(
            "/classify",
            files={"file": ("test_image.png", image_bytes, "image/png")},
        )
        body = response.json()
        assert body["total_objects_detected"] == len(body["detections"])

    def test_classify_each_detection_has_correct_fields(self):
        """Vérifie la structure de chaque objet détecté"""
        image_bytes = make_fake_image_bytes()
        response = client.post(
            "/classify",
            files={"file": ("test_image.png", image_bytes, "image/png")},
        )
        body = response.json()
        for det in body["detections"]:
            assert "label" in det
            assert "confidence" in det
            assert "bin_color" in det
            assert "advice" in det
            assert 0.0 <= det["confidence"] <= 1.0


class TestClassifyValidation:
    """C12.3 — L'endpoint /classify doit rejeter les requêtes invalides"""

    def test_classify_without_file_returns_422(self):
        """Appel sans fichier → 422 Unprocessable Entity (FastAPI validation)"""
        response = client.post("/classify")
        assert response.status_code == 422

    def test_classify_filename_is_preserved(self):
        image_bytes = make_fake_image_bytes()
        response = client.post(
            "/classify",
            files={"file": ("ma_bouteille.png", image_bytes, "image/png")},
        )
        body = response.json()
        assert body["filename"] == "ma_bouteille.png"
