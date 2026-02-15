
# 📄 Phase 1 : Données & Entraînement IA (PFE Smart Recycle)

## 📌 Objectif
Cette phase couvre la validation des blocs de compétences **Data Engineering (Bloc 1)** et **IA Engineering (Bloc 2)**. L'objectif était de construire un modèle de classification d'images capable de reconnaître 6 types de déchets pour l'application de tri sélectif.

## 🛠️ Data Engineering (Bloc 1)

### 1. Préparation du Dataset
Nous avons utilisé le dataset **TrashNet** (« dataset-resized ») contenant 2527 images réparties en 6 classes :
- `cardboard` (Carton)
- `glass` (Verre)
- `metal` (Métal)
- `paper` (Papier)
- `plastic` (Plastique)
- `trash` (Déchets divers)

### 2. Pipeline de Données
Un script Python dédié (`01_IA_LAB/split_dataset.py`) a été développé pour automatiser la ségrégation des données :
- **Répartition** : 80% Entraînement / 20% Validation.
- **Mélange** : Aléatoire (shuffle) pour éviter les biais.
- **Structure** : Organisation compatible avec `torchvision.datasets.ImageFolder`.
  - `01_IA_LAB/data/train/` : ~2000 images.
  - `01_IA_LAB/data/val/` : ~500 images.

## 🧠 Modélisation IA (Bloc 2)

### 1. Choix Technologiques
- **Framework** : PyTorch.
- **Environnement** : Mac Apple Silicon (M1/M2/M3).
- **Accélération Matérielle** : Utilisation du backend **MPS (Metal Performance Shaders)** pour exploiter le GPU Apple, remplaçant CUDA (Nvidia).

### 2. Architecture du Modèle
Nous avons opté pour le **Transfer Learning** (Apprentissage par transfert) :
- **Backbone** : ResNet18 (Réseau Résiduel à 18 couches) pré-entraîné sur ImageNet.
- **Adaptation** : Remplacement de la dernière couche *Fully Connected* (`fc`) pour classifier nos 6 classes spécifiques au lieu des 1000 classes d'origine.

### 3. Stratégie d'Entraînement
Le notebook `01_IA_LAB/notebooks/training_pytorch.ipynb` implémente le processus suivant :
- **Data Augmentation** (Train) : `RandomResizedCrop` et `RandomHorizontalFlip` pour robustifier le modèle.
- **Normalisation** : Utilisation des moyennes et écarts-types d'ImageNet.
- **Optimiseur** : SGD (Stochastic Gradient Descent) avec Momentum (0.9) et Learning Rate (0.001).
- **Loss Function** : `CrossEntropyLoss`.
- **Scheduler** : `StepLR` (réduction du learning rate tous les 7 epochs).

### 4. Résultats & Performance
L'entraînement a été réalisé sur 10 epochs.
- **Epoch 0** : Précision Val ~76%.
- **Epoch 9** : Précision Val **~90.5%** (Best Accuracy).
- **Temps d'entraînement** : ~9 minutes sur Mac (MPS).

### 5. Correction Technique (Spécifique Mac)
Un problème de compatibilité MPS a été identifié et résolu : le tenseur `running_corrects` devait être explicitement converti en `float32` (`.float()`) au lieu de `float64` (`.double()`), car le backend Metal ne supporte pas la double précision par défaut.

## ✅ Livrables Phase 1
- [x] Script de préparation des données (`split_dataset.py`).
- [x] Notebook d'entraînement validé (`training_pytorch.ipynb`).
- [x] Modèle exporté (`waste_model.pth`) prêt pour l'inférence.
