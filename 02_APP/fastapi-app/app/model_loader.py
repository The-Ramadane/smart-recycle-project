
import torch
from torchvision import models, transforms
from PIL import Image
import torch.nn as nn
import io
import os
import pillow_heif
pillow_heif.register_heif_opener()

# Configuration
DEVICE = torch.device("cpu") # Inférence sur CPU pour simplifier le déploiement Docker
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "waste_model.pth")
CLASS_NAMES = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']

class ModelLoader:
    def __init__(self):
        self.model = self._load_model()
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        print(f"✅ Modèle chargé sur {DEVICE}")

    def _load_model(self):
        # Charger l'architecture ResNet50
        model = models.resnet50(pretrained=False) # On charge sans poids pré-entraînés car on a les nôtres
        num_ftrs = model.fc.in_features
        model.fc = nn.Linear(num_ftrs, len(CLASS_NAMES))
        
        # Charger nos poids entraînés
        try:
            state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
            model.load_state_dict(state_dict)
            model.eval() # Mode évaluation
            return model
        except Exception as e:
            print(f"❌ Erreur chargement modèle: {e}")
            raise e

    def predict(self, image_bytes):
        # Préparer l'image
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        tensor = self.transform(image).unsqueeze(0).to(DEVICE)
        
        # Inférence
        with torch.no_grad():
            outputs = self.model(tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)
            
        label = CLASS_NAMES[predicted_idx.item()]
        confidence_score = confidence.item()
        
        # Logique métier simplifiée (Couleurs poubelles France)
        bin_colors = {
            'glass': 'green',       # Verre -> Vert
            'paper': 'yellow',      # Papier -> Jaune
            'cardboard': 'yellow',  # Carton -> Jaune
            'plastic': 'yellow',    # Plastique -> Jaune
            'metal': 'yellow',      # Métal -> Jaune
            'trash': 'gray'         # Déchets ménagers -> Gris/Noir
        }
        
        advice = {
            'glass': 'À jeter dans le conteneur à verre, sans bouchon.',
            'paper': 'Dans la poubelle jaune. Pas besoin de froisser.',
            'cardboard': 'Plier les cartons avant de les mettre dans la poubelle jaune.',
            'plastic': 'Bouteilles et flacons uniquement. Poubelle jaune.',
            'metal': 'Boîtes de conserve, canettes... Poubelle jaune.',
            'trash': 'Déchets non recyclables. Poubelle grise/noire.'
        }

        return {
            "label": label,
            "confidence": confidence_score,
            "bin_color": bin_colors.get(label, "unknown"),
            "advice": advice.get(label, "Consultez les consignes locales.")
        }

# Instance globale pour éviter de recharger à chaque requête
model_loader = ModelLoader()
