from ultralytics import YOLO
import os
import pandas as pd
import matplotlib.pyplot as plt

def plot_metrics(csv_path, save_dir):
    """Génère et sauvegarde les courbes de Loss et de Précision d'après le CSV de YOLO."""
    print(f"📊 Génération du graphique des performances depuis {csv_path}...")
    try:
        # Lire les résultats bruts. Les noms de colonnes dans YOLO ont souvent des espaces autour
        df = pd.read_csv(csv_path)
        df.columns = df.columns.str.strip()  # Nettoyage des noms de colonnes
        
        epochs = df['epoch']
        
        # YOLO génère plusieurs types de loss. On s'intéresse généralement à Box Loss
        train_box_loss = df['train/box_loss']
        val_box_loss = df['val/box_loss']
        
        # Pour l'accuracy en détection d'objet on regarde généralement la mAP (Mean Average Precision)
        map50 = df['metrics/mAP50(B)']

        plt.figure(figsize=(12, 5))

        # Sous-graphique 1 : La fonction de perte (Loss)
        plt.subplot(1, 2, 1)
        plt.plot(epochs, train_box_loss, label='Train Box Loss', color='blue', marker='o', markersize=4)
        plt.plot(epochs, val_box_loss, label='Validation Box Loss', color='red', marker='x', markersize=4)
        plt.title('Évolution de la fonction Loss (Bounding Boxes)')
        plt.xlabel('Epochs')
        plt.ylabel('Box Loss')
        plt.grid(True)
        plt.legend()

        # Sous-graphique 2 : L'Accuracy (mAP à 50%)
        plt.subplot(1, 2, 2)
        plt.plot(epochs, map50, label='mAP@50 (Accuracy)', color='green', marker='s', markersize=4)
        plt.title('Précision Moyenne du Modèle (mAP50)')
        plt.xlabel('Epochs')
        plt.ylabel('Score mAP')
        plt.grid(True)
        plt.legend()

        plt.tight_layout()
        plot_path = os.path.join(save_dir, "custom_training_metrics.png")
        plt.savefig(plot_path)
        print(f"✅ Graphique personnalisé sauvegardé sous : {plot_path}")
        
    except Exception as e:
        print(f"⚠️ Impossible de générer les graphiques : {e}")

def main():
    print("🚀 Initialisation du modèle YOLOv10...")
    
    # Charger un modèle YOLOv10 pré-entraîné (Version 'Nano' pour être rapide et léger)
    # Assurez-vous d'avoir 'ultralytics' à jour : pip install -U ultralytics
    try:
        model = YOLO("yolov10n.pt") 
    except Exception as e:
        print(f"Erreur lors du chargement de YOLOv10 (essayez de mettre à jour ultralytics): {e}")
        # Fallback automatique sur YOLOv8 si ultralytics n'est pas encore assez à jour localement
        print("Fallback sur YOLOv8n...")
        model = YOLO("yolov8n.pt")

    # Définition du chemin absolu vers le fichier data.yaml qu'on vient de créer
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_yaml_path = os.path.join(base_dir, "dataset_yolo", "data.yaml")
    
    print(f"📁 Fichier d'entraînement ciblé : {data_yaml_path}")
    print("🔥 Début de l'entraînement sur Apple Silicon (MPS)...")

    # Lancement de l'entraînement
    results = model.train(
        data=data_yaml_path,
        epochs=25,          # On commence par 25 epochs pour voir les premiers résultats rapidement
        imgsz=640,          # Taille d'image standard YOLO
        device="mps",       # Accélération matérielle Apple (M1/M2/M3/M4)
        batch=16,           # Taille du lot d'images par itération
        workers=4,          # Cœurs CPU pour charger les données
        project="smart_recycle_yolo",
        name="yolov10_custom",
        patience=10         # Arrête l'entraînement si plus de progression
    )

    print("✅ Entraînement terminé ! Le meilleur modèle est sauvegardé dans :")
    print("smart_recycle_yolo/yolov10_custom/weights/best.pt")

    # Génération du graphique final depuis les résultats de YOLO
    csv_path = os.path.join("smart_recycle_yolo", "yolov10_custom", "results.csv")
    if os.path.exists(csv_path):
        plot_metrics(csv_path, os.path.join("smart_recycle_yolo", "yolov10_custom"))
    else:
        print("⚠️ results.csv introuvable. Avez-vous annulé l'entraînement prématurément ?")

if __name__ == "__main__":
    main()
