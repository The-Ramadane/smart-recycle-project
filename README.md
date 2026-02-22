# ♻️ Smart Recycle Project

Bienvenue dans le dépôt du **Smart Recycle Project**, une application web intelligente conçue pour aider les utilisateurs à trier correctement leurs déchets grâce à l'Intelligence Artificielle. Ce projet est développé dans le cadre de mon Projet de Fin d'Études (PFE).

---

## 🏗️ Architecture du Projet

Le projet a été développé de manière itérative, en séparant la logique métier IA de l'infrastructure web. 

### Phase 1 : Laboratoire IA (`01_IA_LAB`) 🧠
Création et entraînement du modèle de reconnaissance d'images.
*   **Modèle :** ResNet50 pré-entraîné, fine-tuné sur notre dataset (images de déchets : plastique, verre, carton, etc.).
*   **Technologie :** PyTorch, Torchvision, Pillow.
*   *Résultat :* Un fichier `waste_model.pth` ultra-performant exporté pour le backend.

### Phase 2 : Backend API (`02_APP/fastapi-app`) 🐳
Un microservice dédié pour servir le modèle IA et exposer un endpoint rapide et fiable.
*   **Framework :** FastAPI (Python).
*   **Fonctionnalité :** Reçoit des images via l'endpoint `/classify`, les convertit en tenseurs, passe l'image au modèle ResNet50, calcule le score de confiance (`Softmax`) et renvoie la couleur de la poubelle appropriée avec un conseil.
*   **Déploiement :** Entièrement containerisé avec **Docker** (`docker build -t smart-recycle-ai .`). Supporte le HMR (Hot-reloading) pour le développement local.

### Phase 3 : Frontend & Interface Utilisateur (`02_APP/nextjs-app`) 🌐
Une Progressive Web App moderne pour interagir avec l'IA, avec un système de comptes pour sauvegarder l'historique et gamifier l'expérience.
*   **Framework :** Next.js 16 (App Router).
*   **UI/Design :** Tailwind CSS v4, Shadcn/ui (Radix), Framer Motion pour les animations fluides, Lucide React pour l'iconographie.
*   **UX "Premium" :** 
    * "Glassmorphism" et design mobile-first.
    * Animations simulant l'analyse d'IA (Loader, ScanLine).
    * Seuil de confiance IA : si le backend est confiant à *< 60%*, le frontend bascule en mode "Incertain" et cache la couleur de la poubelle pour ne pas induire l'utilisateur en erreur.
*   **Base de données & ORM :**
    * PostgresSQL (Dockerisé)
    * Prisma ORM
*   **Authentification et Sessions :** NextAuth.js avec OAuth (Google / GitHub). Permet la "Lazy Registration" en invitant l'utilisateur à créer un compte lorsqu'il souhaite sauvegarder son premier scan.
*   **Dashboard Utilisateur :** Suivi XP, Points, Historique complet des scans.

---

## 🚀 Comment lancer le projet en local (Développement)

### Pré-requis
*   Docker & Docker Compose installés.
*   Node.js (v18+) installé.
*   (Optionnel) Python 3.10+ si exécution de l'API hors Docker.

### 1. Démarrer l'infrastructure
À la racine du projet, un fichier `docker-compose.yml` orchestre à la fois le Backend IA (FastAPI) et la base de données (PostgreSQL sur le port `5433`).

```bash
docker-compose up -d
```
*Le backend sera accessible sur `http://localhost:8000`.*

### 2. Configurer le Frontend (Variables d'Environnement)
Dans le dossier `02_APP/nextjs-app`, créez un fichier `.env` avec ces informations :

```env
DATABASE_URL="postgresql://smartrecycle:smartpassword@localhost:5433/smartrecycle_db?schema=public"

# ================================
# Configuration Authentification (NextAuth)
# ================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre_secret_aleatoire_ici"

# -- GOOGLE OAUTH --
GOOGLE_CLIENT_ID="VOTRE_ID_CLIENT_GOOGLE"
GOOGLE_CLIENT_SECRET="VOTRE_SECRET_CLIENT_GOOGLE"
```

### 3. Migrer la Base de données
Mettez à jour le schéma Prisma dans PostgreSQL généré par Docker. Mettez-vous dans le dossier Next.js :

```bash
cd 02_APP/nextjs-app
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Lancer le Frontend Next.js
Dans le même dossier `02_APP/nextjs-app` :

```bash
npm run dev
```

*Le Frontend sera accessible sur `http://localhost:3000`.*

---

## 🎮 Phase 4 : Gamification (Terminée ✅)
La couche d'engagement utilisateur permettant de transformer l'acte de recycler en un jeu gratifiant avec un impact réel. Elle inclut :
* **Moteur d'XP Dynamique** : Points de base par objet valide + Bonus (+5 XP) si l'IA possède une forte certitude (>90%).
* **Système de Niveaux** : Passage à l'échelon supérieur automatique tous les 100 XP (`Niveau = 1 + Points/100`).
* **Série de Jours (Streaks 🔥)** : Encourage l'utilisation quotidienne en gardant le compte des jours consécutifs où un déchet est scanné.
* **Moteur de Badges** : Attribution de badges automatiques sur le Dashboard (ex: *Premier Pas*, *Éco-Guerrier* à 5 scans, etc.).
* **Classement Général (Leaderboard Top 5) 🥇** : Affichage côté carte au sein du Dashboard des 5 meilleurs recycleurs de la plateforme en fonction de leurs points globaux et leur avatar.
* **Impact Communautaire** : Carte globale "Green-Tech" affichant en temps réel le nombre total d'objets détectés sur toute la plateforme et sa conversion estimative équivalente en grammes de *CO₂ évités* (~150g/déchet).

*(Projet initié par Ramadane)*