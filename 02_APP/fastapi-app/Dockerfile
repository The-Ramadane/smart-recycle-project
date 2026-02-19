
# Utiliser une image Python officielle légère
FROM python:3.10-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances en premier (pour optimiser le cache Docker)
COPY requirements.txt .

# Installer les dépendances
# L'option --no-cache-dir permet de réduire la taille de l'image finale
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste du code de l'application
COPY app/ app/

# Exposer le port sur lequel l'API va tourner
EXPOSE 8000

# Commande pour lancer l'application avec Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
