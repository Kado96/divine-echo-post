# Divine Echo - Shalom Ministry

Application complète pour la gestion du ministère Shalom, comprenant un backend Django et un frontend React.

## 🚀 Structure du Projet

- **Backend** : Django REST Framework, PostgreSQL (Supabase) en production, SQLite en développement.
- **Frontend** : React, Vite, Tailwind CSS, TypeScript.

---

## 🛠️ Workflow de Développement : Local vers Production

Ce projet est configuré pour utiliser une base de données **SQLite en local** pour les tests et le développement, et **Supabase (PostgreSQL) en production** (sur Render).

Pour transférer facilement vos modifications (code et données) de votre ordinateur vers le site en ligne, voici la procédure.

### Étape 1 : Développement Local (SQLite)
Développez, testez, et ajoutez des données (articles, utilisateurs, etc.) sur votre machine sans toucher au site en production.

1. Vérifiez que votre fichier `backend/.env` contient bien :
   ```env
   DATABASE_URL=votre_url_supabase_complete
   USE_LOCAL_SQLITE=True
   ```
   *La ligne `USE_LOCAL_SQLITE=True` force votre ordinateur à utiliser la base locale (db.sqlite3) au lieu de Supabase.*

2. **CRITIQUE** : Si vous modifiez la structure de la base (fichiers `models.py`), faites toujours vos migrations en local :
   ```powershell
cd e:\Application\Eglise\Shalom\divine-echo-post\backend
.\venv\Scripts\activate
python manage.py makemigrations
python manage.py migrate

   ```

### Étape 2 : Déploiement et Synchronisation

Quand vos données locales sont prêtes à être publiées en ligne pour vos utilisateurs :

**A. Envoyer le Code (déploie sur Render)** :
Envoyez vos modifications sur Github. Render mettra à jour l'application automatiquement.
```powershell
git add .
git commit -m "Mise à jour"
git push
```

**B. Envoyer les Données (remplit Supabase)** :
Copiez vos données ajoutées ou modifiées en local vers la base de production (Supabase). Depuis le dossier `backend/` :
```powershell
.\venv\Scripts\activate
.\sync_local_to_prod.ps1
```
*(Ce script est intelligent : il lit votre SQLite et le pousse vers Supabase. Il met à jour ce qui a changé sans créer de doublons).*

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

## 📝 Notes et Sécurité
- Le fichier local `backend/db.sqlite3` ne sera **jamais** envoyé sur Github (il est protégé par `.gitignore`). La base de données en production n'est donc jamais écrasée.
- Les fichiers médias (images importées) ne sont pas synchronisés par le script de base de données.
- Render applique automatiquement les structures de base de données à Supabase lors du déploiement via la commande `migrate`.

