# 🚀 Divine Echo - Shalom Ministry

Application complète de gestion et de diffusion pour le ministère **Shalom**, optimisée pour une robustesse maximale et une séparation stricte entre développement et production.

---

## 🏛️ Structure du Projet

- **Backend** : Django REST Framework, PostgreSQL (**Supabase**) en production, SQLite en développement local.
- **Frontend** : React, Vite, Tailwind CSS, TypeScript, Framer Motion (animations).
- **Langues supportées** : Français (FR), Kirundi (RN), Anglais (EN), Kiswahili (SW).

---

## 🛠️ Workflow de Développement : Local vers Production

Le projet utilise une architecture de synchronisation "One-Way" (Local -> Prod) pour garantir la sécurité des données et la performance.

### Étape 1 : Développement Local (SQLite)
Travaillez en toute sécurité sur votre machine sans impacter le site en ligne.

1. **Configuration (`backend/.env`)** :
   ```env
   DATABASE_URL=votre_url_supabase_ou_sqlite
   USE_LOCAL_SQLITE=True
   DEBUG=True
   ```
   *Note : `USE_LOCAL_SQLITE=True` est obligatoire en local pour éviter les limites de connexions Supabase.*

2. **Migrations de structure** :
   ```powershell
   cd backend
   .\venv\Scripts\activate
   python manage.py makemigrations
   python manage.py migrate
   ```

### Étape 2 : Déploiement et Synchronisation

**1. Déploiement du Code (GitHub -> Render)** :
Envoyez votre code sur GitHub. Le backend se déploie automatiquement sur **Render**.
```powershell
git add .
git commit -m "Description de vos changements"
git push
```

**2. Synchronisation des Données (Local -> Supabase)** :
Utilisez le script intelligent pour envoyer vos nouveaux articles ou sermons :
```powershell
python sync_local_to_prod.py
```
*Le script compare la base locale et Supabase pour mettre à jour les données sans créer de doublons.*

---

## 🏗️ Architecture Technique de Robustesse

Ce projet intègre des mécanismes de protection avancés contre les erreurs classiques de production.

### 1. Synchronisation Intelligente (Clés Naturelles)
Contrairement à un simple export SQL, le script `sync_local_to_prod.py` utilise :
- **Identification par "Sens"** : Les objets sont cherchés par leur Nom (Catégories), Titre (Sermons) ou Username (Utilisateurs).
- **Mappage Dynamique des IDs** : Si un utilisateur a l'ID 75 en local et l'ID 12 sur Supabase, le script mémorise ce changement et traduit automatiquement toutes les relations (clés étrangères) à la volée.

### 2. Robustesse Frontend (Safe Array Extraction)
Pour éviter le crash `data.map is not a function` dû à la pagination Django en production :
- Le connecteur `frontend/src/lib/api.ts` intègre un filtre de robustesse global.
- Chaque appel à une liste de données (Sermons, Actualités) extrait automatiquement le tableau, qu'il soit brut ou encapsulé dans un objet `{ results: [...] }`.

### 3. Prévention de l'Erreur "405 Method Not Allowed"
L'URL de l'API (`VITE_API_URL`) doit pointer exclusivement vers le serveur **Render/Python** et non vers l'hébergement statique (ex: Wuaze, InfinityFree) pour permettre les requêtes `POST` et `PATCH`.

### 4. Accessibilité et Autofill (Formulaires)
Tous les formulaires respectent les standards **W3C/Lighthouse** :
- **Labels** liés aux `id` pour les lecteurs d'écran.
- **Attributs Name** pour la capture de données.
- **Auto-complete** (`email`, `current-password`) pour les gestionnaires de mots de passe.

---

## 💻 Installation Rapide

### Backend (Python)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (React/Vite)
```powershell
cd frontend
npm install
npm run dev
```

---

## ⚙️ Administration

- **Accès Admin** : `/admin/login` sur le frontend.
- **Initialisation** : Pour réinitialiser les textes et langues par défaut :
  ```powershell
  python populate_defaults.py
  ```

## 📝 Sécurité
- `db.sqlite3` et `.env` sont exclus de Git.
- Les accès API sont protégés par des tokens **JWT** sécurisés.
- Support des fichiers médias via proxy pour éviter les erreurs CORS Google Drive.
