# Divine Echo - Shalom Ministry

Application complète pour la gestion du ministère Shalom, comprenant un backend Django et un frontend React.

## 🚀 Structure du Projet

- **Backend** : Django REST Framework, PostgreSQL (Supabase) en production, SQLite en développement.
- **Frontend** : React, Vite, Tailwind CSS, TypeScript.

---

## 💾 Migration des données : SQLite vers Supabase (Le Guide Définitif)

Cette section explique comment transférer vos données locales (SQLite) vers votre instance de production Supabase (PostgreSQL), sans créer de doublons.

### 1. Pré-requis
1. Votre base de données Supabase créée.
2. Votre URL de connexion (Connection String) au format URI.
   * Exemple : `postgresql://postgres.[ID_PROJET]:[MOT_DE_PASSE]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require`

### 2. Configuration (Local & Render)
* **En Local** : Dans le dossier `backend/`, créez ou modifiez votre fichier `.env` en y ajoutant :
  ```env
  DATABASE_URL=votre_url_supabase_complete
  ```
* **En Production (Render)** : Allez dans votre dashboard Render, onglet *Environment Variables*, et ajoutez cette même variable `DATABASE_URL`. Votre site en ligne utilisera ainsi Supabase !

### 3. Méthode A : Synchronisation Automatisée Intelligente (Recommandée)
Un script Python personnalisé (`sync_local_to_prod.py`) a été créé pour gérer intelligemment la migration.
Avantages : **Idempotent** (Il ne crée pas de doublons, il met à jour s'il trouve des données existantes avec le même ID).

1. Allez dans le dossier backend et activez l'environnement virtuel :
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   ```
2. Lancez une simulation (Dry-Run) sans écrire de données pour vérifier :
   ```powershell
   python sync_local_to_prod.py --dry-run
   ```
3. Exécutez la synchronisation réelle :
   ```powershell
   python sync_local_to_prod.py --confirm
   ```

### 4. Méthode B : Sauvegarde de sécurité UTF-8 (Export/Import)
Si vous souhaitez exporter un fichier de sauvegarde manuel JSON, il faut faire attention à l'encodage sous Windows.

1. **Exportation (Locale)** : Utilisez le script PowerShell fourni. Il gère l'encodage `UTF-8` et évite les erreurs de caractères corrompus :
   ```powershell
   .\dumpdata.ps1 data.json
   ```
2. **Importation (Sur Supabase)** : Si votre `DATABASE_URL` pointe bien vers Supabase dans votre `.env` :
   ```powershell
   python manage.py loaddata data.json
   ```
   *(⚠️ Attention : `loaddata` gère moins bien les conflits "Idempotents" que notre script A).*

---

## 🛠️ Installation Locale

### Backend
```sh
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```sh
cd frontend
npm install
npm run dev
```

---

## 🌐 Déploiement

- **Backend** : Déployé sur Render (configuré via le `Procfile` et `build.sh`).
- **Frontend** : Peut être déployé via Lovable, Vercel ou Netlify.

---

## 📝 Notes Importantes
- Les fichiers médias (images, documents) se trouvent dans le dossier `backend/media`. La migration de la base de données ne transfère que les liens. Vous devez uploader les fichiers physiques séparément ou utiliser un stockage S3/Supabase Storage.

