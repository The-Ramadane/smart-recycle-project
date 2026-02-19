
import os
import shutil
import random
from pathlib import Path

# Configuration
SOURCE_DIR = Path("../dataset-resized")  # Relatif à 01_IA_LAB
BASE_DIR = Path("../data")
TRAIN_DIR = BASE_DIR / "train"
VAL_DIR = BASE_DIR / "val"
SPLIT_RATIO = 0.8  # 80% train, 20% val

# Catégories (basées sur les dossiers existants)
CATEGORIES = ["cardboard", "glass", "metal", "paper", "plastic", "trash"]

def setup_directories():
    """Crée l'arborescence data/train et data/val"""
    if BASE_DIR.exists():
        print(f"⚠️  Le dossier {BASE_DIR} existe déjà. Suppression pour repartir de zéro...")
        shutil.rmtree(BASE_DIR)
    
    for category in CATEGORIES:
        (TRAIN_DIR / category).mkdir(parents=True, exist_ok=True)
        (VAL_DIR / category).mkdir(parents=True, exist_ok=True)
    print("✅ Dossiers train/val créés.")

def split_data():
    """Répartit les images aléatoirement"""
    total_images = 0
    
    if not SOURCE_DIR.exists():
        print(f"❌ Erreur : Le dossier source '{SOURCE_DIR}' est introuvable !")
        return

    print(f"🔄 Début du split depuis {SOURCE_DIR}...")

    for category in CATEGORIES:
        source_category_dir = SOURCE_DIR / category
        if not source_category_dir.exists():
            print(f"⚠️  Attention : La catégorie '{category}' n'existe pas dans la source.")
            continue
            
        images = [f for f in source_category_dir.iterdir() if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png']]
        random.shuffle(images)
        
        split_idx = int(len(images) * SPLIT_RATIO)
        train_images = images[:split_idx]
        val_images = images[split_idx:]
        
        # Copie vers Train
        for img in train_images:
            shutil.copy2(img, TRAIN_DIR / category / img.name)
            
        # Copie vers Val
        for img in val_images:
            shutil.copy2(img, VAL_DIR / category / img.name)
            
        print(f"   - {category}: {len(train_images)} train, {len(val_images)} val")
        total_images += len(images)

    print(f"\n🎉 Terminé ! {total_images} images réparties dans {BASE_DIR}")

if __name__ == "__main__":
    setup_directories()
    split_data()
