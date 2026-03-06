
# ========================================
# 🧠 Smart Recycle API - YOLO11 Backend
# ========================================

# Image Python officielle légère
FROM python:3.11-slim

# Éviter les prompts interactifs
ENV DEBIAN_FRONTEND=noninteractive

# Installer les dépendances système nécessaires pour OpenCV (utilisé par ultralytics/YOLO)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances en premier (pour optimiser le cache Docker)
COPY requirements.txt .

# Installer les dépendances Python
# --no-cache-dir réduit la taille de l'image finale
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application (inclut le modèle best.pt)
COPY app/ app/

# Exposer le port sur lequel l'API va tourner
EXPOSE 8000

# Commande pour lancer l'application avec Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
