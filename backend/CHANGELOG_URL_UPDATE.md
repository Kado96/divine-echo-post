# 📝 Changelog - Mise à Jour des URLs API

## 🎯 Objectif

Remplacer toutes les occurrences de `http://10.10.107.14:8000/api/` par `http://localhost:8080/api/` pour utiliser le proxy Vite en développement.

## ✅ Modifications apportées

### Frontend

#### `frontend/src/lib/api.ts`
- ✅ Remplacé `http://10.10.107.14:8000` par chemin relatif `""` (vide)
- ✅ Le proxy Vite redirige automatiquement `/api` vers `http://localhost:8000/api`

#### `frontend/vite.config.ts`
- ✅ Activé le proxy Vite pour `/api`
- ✅ Configuration : `target: 'http://localhost:8000'`
- ✅ Le frontend utilise maintenant `http://localhost:8080/api/` (via proxy)

### Backend

#### `backend/start_dev.ps1`
- ✅ Modifié pour démarrer sur `127.0.0.1:8000` au lieu de `10.10.107.14:8000`
- ✅ Simplifié la logique de détection d'adresse IP

#### `backend/start_dev.bat`
- ✅ Modifié pour démarrer sur `127.0.0.1:8000`

#### `backend/shalomministry/settings.py`
- ✅ Retiré `'10.10.107.14'` de `ALLOWED_HOSTS`
- ✅ Conservé `'localhost'`, `'127.0.0.1'`, et `'*'`

### Documentation

#### `backend/API_ARCHITECTURE.md`
- ✅ Mis à jour les exemples d'URLs pour utiliser `/api/` (chemin relatif)
- ✅ Mis à jour la base URL de développement

#### `backend/API_USAGE_GUIDE.md`
- ✅ Mis à jour tous les exemples pour utiliser `/api/` (chemin relatif)

#### `backend/API_MAINTENANCE_GUIDE.md`
- ✅ Mis à jour les exemples curl et Python pour utiliser `localhost:8080`

## 🔄 Architecture Mise à Jour

### Avant
```
Frontend (localhost:8080) → http://10.10.107.14:8000/api/ → Backend Django
```

### Après
```
Frontend (localhost:8080) → /api/ → Proxy Vite → http://localhost:8000/api/ → Backend Django
```

## ✅ Avantages

1. **Pas de problèmes CORS** : Le proxy Vite gère automatiquement CORS
2. **Pas de problèmes d'adresse IP** : Plus besoin de configurer une adresse IP spécifique
3. **Configuration simplifiée** : Un seul fichier de configuration (vite.config.ts)
4. **Développement local standard** : Utilise localhost comme convention

## 🚀 Utilisation

### Démarrer le backend
```powershell
cd backend
.\start_dev.ps1
```

Le serveur démarre sur `http://localhost:8000`

### Démarrer le frontend
```powershell
cd frontend
npm run dev
```

Le frontend démarre sur `http://localhost:8080` et le proxy redirige `/api` vers le backend.

## 📋 Fichiers Modifiés

### Frontend
- `frontend/src/lib/api.ts`
- `frontend/vite.config.ts`

### Backend
- `backend/start_dev.ps1`
- `backend/start_dev.bat`
- `backend/shalomministry/settings.py`

### Documentation
- `backend/API_ARCHITECTURE.md`
- `backend/API_USAGE_GUIDE.md`
- `backend/API_MAINTENANCE_GUIDE.md`

## ⚠️ Notes

- Les fichiers de documentation dans `backend/` peuvent encore contenir des références à `10.10.107.14:8000` dans les exemples, mais ils sont maintenant mis à jour pour utiliser `localhost:8080` ou des chemins relatifs.
- Le proxy Vite fonctionne uniquement en développement. En production, utilisez `VITE_API_URL` dans `.env.production`.

