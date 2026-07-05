import logging
import time
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .model_loader import model_loader
import os
from dotenv import load_dotenv
import sentry_sdk

load_dotenv() # Charge les variables du fichier .env

# ── Configuration Sentry (Monitoring Externe) ───────────────────────
sentry_dsn = os.getenv("SENTRY_DSN")
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        traces_sample_rate=1.0,
    )

# ── Configuration des logs (Monitoring) ─────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(),                         # Affichage console
        logging.FileHandler("app.log", encoding="utf-8") # Fichier app.log
    ]
)
logger = logging.getLogger("smart_recycle")

# ── Application FastAPI ────────────────────────────────────────────────────
app = FastAPI(title="Smart Recycle API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("🚀 Smart Recycle API démarrée avec succès")


@app.get("/")
def read_root():
    logger.info("GET / — Health check OK")
    return {"message": "Smart Recycle API is running ♻️"}


@app.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    """Reçoit une image et renvoie la catégorie de déchet détectée par YOLO"""
    start_time = time.time()

    logger.info(f"POST /classify — Fichier reçu : '{file.filename}' | Type : {file.content_type}")

    try:
        contents = await file.read()

        if len(contents) == 0:
            logger.warning("Fichier vide reçu — requête rejetée")
            raise HTTPException(status_code=400, detail="Le fichier image est vide.")

        # =====================================================================
        # 🐛 INJECTION DU BUG (SIMULATION CRASH SUR FICHIER CORROMPU)
        # =====================================================================
        if file.filename.startswith("crash_"):
            logger.error("Image illisible ou format non supporté détecté.")
            raise ValueError("UnidentifiedImageError: image file could not be identified because it is corrupted or format is not supported")
        # =====================================================================

        # Appel au modèle YOLO
        predictions = model_loader.predict(contents)

        elapsed = round((time.time() - start_time) * 1000, 1)

        if predictions:
            labels = ", ".join(f"{p['label']} ({p['confidence']:.0%})" for p in predictions)
            logger.info(f"✅ Détection réussie en {elapsed}ms — Objets : {labels}")
        else:
            logger.info(f"⚠️  Aucun objet détecté (seuil conf=0.40) — {elapsed}ms")

        return {
            "filename": file.filename,
            "detections": predictions,
            "total_objects_detected": len(predictions)
        }

    except HTTPException:
        raise
    except Exception as e:
        elapsed = round((time.time() - start_time) * 1000, 1)
        logger.error(f"❌ Erreur lors de la classification ({elapsed}ms) — {type(e).__name__}: {e}")
        sentry_sdk.capture_exception(e) # 🚨 Capture de l'erreur par Sentry
        raise HTTPException(status_code=500, detail=f"Erreur interne du serveur : {str(e)}")

@app.get("/sentry-debug")
async def trigger_error():
    division_by_zero = 1 / 0

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
