import os
import io
import torch
from PIL import Image
from ultralytics import YOLO

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "best.pt")

class ModelLoader:
    def __init__(self):
        self.model = self._load_model()
        print(f"✅ Modèle YOLO chargé depuis {MODEL_PATH}")

    def _load_model(self):
        try:
            # YOLO charge automatiquement l'architecture et les poids
            model = YOLO(MODEL_PATH)
            return model
        except Exception as e:
            print(f"❌ Erreur chargement modèle YOLO: {e}")
            raise e

    def predict(self, image_bytes):
        # Préparer l'image pour YOLO
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Inférence avec YOLO
        # imgsz=640 par défaut, conf=0.25 (on filtre ce qui est en dessous de 25% de confiance)
        results = self.model.predict(source=image, conf=0.40, save=False)
        
        detected_objects = []
        
        # Logique métier (Poubelles de tri françaises typiques)
        bin_colors = {
            'BIODEGRADABLE': 'green', # Ou marron (compost)
            'GLASS': 'green',         # Verre -> Vert
            'PAPER': 'yellow',        # Papier -> Jaune
            'CARDBOARD': 'yellow',    # Carton -> Jaune
            'PLASTIC': 'yellow',      # Plastique -> Jaune
            'METAL': 'yellow'         # Métal -> Jaune
        }
        
        advice = {
            'BIODEGRADABLE': 'Composteur ou poubelle des biodéchets (marron/verte).',
            'GLASS': 'À jeter dans le conteneur à verre, sans bouchon ni couvercle.',
            'PAPER': 'Dans la poubelle jaune. Pas besoin de froisser.',
            'CARDBOARD': 'Plier les cartons avant de les mettre dans la poubelle de tri.',
            'PLASTIC': 'Bouteilles et flacons en plastique. Poubelle jaune.',
            'METAL': 'Boîtes de conserve, canettes, barquettes en alu. Poubelle jaune.'
        }

        # Analyser les résultats (YOLO peut détecter plusieurs objets dans la même image)
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # Extraire la classe et la confiance
                class_id = int(box.cls[0].item())
                class_name = self.model.names[class_id]
                confidence_score = float(box.conf[0].item())
                
                # Extraire la boîte de délimitation (x, y, w, h format)
                # On la renvoie en format normalisé ou en pixels. Utilisons pixels [x1, y1, x2, y2].
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                detected_objects.append({
                    "label": class_name,
                    "confidence": round(confidence_score, 3),
                    "box": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                    "bin_color": bin_colors.get(class_name, "gray"),
                    "advice": advice.get(class_name, "Consultez les consignes locales.")
                })

        return detected_objects

# Instance globale
model_loader = ModelLoader()
