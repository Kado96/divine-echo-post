# 🎯 Principes Fondamentaux de l'API

## 📋 Règle d'Or

**TOUTES les opérations sur les données (lecture, création, modification, suppression) doivent passer UNIQUEMENT par l'API REST.**

## ✅ Architecture Validée

### Frontend
```
Frontend → API REST → ViewSet Django → Base de données
```

### Administration
```
Interface Admin → API REST → ViewSet Django → Base de données
```

### Synchronisation (Exception)
```
Script Python → Accès direct DB (uniquement pour sync_local_to_prod.py)
```

## 🔒 Séparation des Rôles

### 1. Frontend (Utilisateur normal)
- **Routes** : `/api/courses/`, `/api/sermons/`, `/api/settings/current/`
- **Permissions** : Lecture seule pour la plupart des ressources
- **Opérations autorisées** :
  - ✅ Lire les cours, sermons, boutiques
  - ✅ Créer ses propres inscriptions (enrollments)
  - ✅ Gérer ses favoris (favorites)
  - ❌ Modifier les cours, sermons (réservé à l'admin)

### 2. Administration (Admin)
- **Routes** : `/api/courses/admin/`, `/api/admin/sermons/`, `/api/admin/shops/`
- **Permissions** : CRUD complet
- **Opérations autorisées** :
  - ✅ Lire toutes les ressources
  - ✅ Créer toutes les ressources
  - ✅ Modifier toutes les ressources
  - ✅ Supprimer toutes les ressources

### 3. Super-Admin Système (Exception)
- **Interface** : `/admin/` (Django Admin)
- **Usage** : Uniquement pour la gestion système, débogage, maintenance
- **Règle** : Ne pas utiliser pour les opérations normales

## 📊 Matrice des Opérations

| Opération | Frontend | Administration | Super-Admin |
|-----------|----------|----------------|-------------|
| **Lire cours** | ✅ `/api/courses/courses/` | ✅ `/api/courses/admin/courses/` | ✅ `/admin/` |
| **Créer cours** | ❌ | ✅ `/api/courses/admin/courses/` | ✅ `/admin/` |
| **Modifier cours** | ❌ | ✅ `/api/courses/admin/courses/{id}/` | ✅ `/admin/` |
| **Supprimer cours** | ❌ | ✅ `/api/courses/admin/courses/{id}/` | ✅ `/admin/` |
| **Lire sermons** | ✅ `/api/sermons/` | ✅ `/api/admin/sermons/sermons/` | ✅ `/admin/` |
| **Créer sermon** | ❌ | ✅ `/api/admin/sermons/sermons/` | ✅ `/admin/` |
| **Modifier sermon** | ❌ | ✅ `/api/admin/sermons/sermons/{id}/` | ✅ `/admin/` |
| **Supprimer sermon** | ❌ | ✅ `/api/admin/sermons/sermons/{id}/` | ✅ `/admin/` |

## 🚫 Ce qui est INTERDIT

### ❌ Accès direct à la base de données
```typescript
// INTERDIT - Ne jamais faire ça
const db = openDatabase('db.sqlite3');
db.executeSql('SELECT * FROM courses', ...);
```

### ❌ Modification des données sans API
```typescript
// INTERDIT
localStorage.setItem('courses', JSON.stringify(modifiedData));
// Puis utiliser ces données modifiées sans les envoyer à l'API
```

### ❌ Utilisation de l'admin Django pour les opérations normales
```
// INTERDIT - Utiliser /admin/ pour créer/modifier des cours normalement
// L'admin Django est réservé à la gestion système uniquement
```

## ✅ Ce qui est AUTORISÉ

### ✅ Toutes les opérations via l'API REST
```typescript
// AUTORISÉ - Utiliser l'API pour toutes les opérations
fetch('/api/courses/admin/courses/', {
  method: 'POST',
  body: JSON.stringify(courseData)
});
```

### ✅ Synchronisation manuelle (exception)
```bash
# AUTORISÉ - Script de synchronisation
python sync_local_to_prod.py
```

## 🔄 Workflow Type

### Scénario 1 : Utilisateur consulte les cours

1. **Frontend** : `GET /api/courses/courses/`
2. **Backend** : `CourseViewSet.list()` récupère les cours
3. **Backend** : Retourne JSON avec les cours
4. **Frontend** : Affiche les cours

### Scénario 2 : Admin crée un cours

1. **Frontend Admin** : Formulaire de création
2. **Frontend Admin** : `POST /api/courses/admin/courses/` avec les données
3. **Backend** : `AdminCourseViewSet.create()` valide et crée
4. **Backend** : Retourne JSON avec le cours créé
5. **Frontend Admin** : Affiche le cours créé

### Scénario 3 : Admin modifie un cours

1. **Frontend Admin** : Formulaire de modification
2. **Frontend Admin** : `PUT /api/courses/admin/courses/{id}/` avec les nouvelles données
3. **Backend** : `AdminCourseViewSet.update()` valide et met à jour
4. **Backend** : Retourne JSON avec le cours modifié
5. **Frontend Admin** : Affiche le cours modifié

### Scénario 4 : Admin supprime un cours

1. **Frontend Admin** : Confirmation de suppression
2. **Frontend Admin** : `DELETE /api/courses/admin/courses/{id}/`
3. **Backend** : `AdminCourseViewSet.destroy()` supprime
4. **Backend** : Retourne 204 No Content
5. **Frontend Admin** : Met à jour l'interface

## 📚 Documentation Complémentaire

- **Architecture complète** : `API_ARCHITECTURE.md`
- **Guide d'utilisation** : `API_USAGE_GUIDE.md`
- **Dépannage** : `TROUBLESHOOTING.md`
- **Synchronisation** : `SYNC_README.md`

## ✅ Validation de l'Architecture

Pour vérifier que votre code respecte ces principes :

1. ✅ Toutes les requêtes frontend utilisent `/api/...`
2. ✅ Toutes les opérations admin utilisent `/api/.../admin/...`
3. ✅ Aucun accès direct à la base de données depuis le frontend
4. ✅ L'admin Django n'est utilisé que pour la gestion système
5. ✅ Toutes les opérations CRUD sont disponibles via l'API

