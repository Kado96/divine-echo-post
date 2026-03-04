# 🏗️ Architecture API - Documentation Complète

## 📋 Vue d'ensemble

**Principe fondamental** : Toutes les opérations sur les données (lecture, création, modification, suppression) passent **UNIQUEMENT** par l'API REST. Aucun accès direct à la base de données n'est autorisé depuis le frontend ou l'administration.

## 🎯 Structure de l'API

### Base URL
- **Développement** : `http://localhost:8080/api/` (via proxy Vite)
- **Production** : `https://votre-domaine.com/api/`

### Authentification
Toutes les routes API (sauf login/register) nécessitent une authentification JWT :
```
Authorization: Bearer <token>
```

## 📚 Endpoints API par Module

### 1. 🔐 Authentification (`/api/accounts/`)

#### Frontend & Administration
- `POST /api/login/` - Connexion (obtient le token JWT)
- `POST /api/register/` - Inscription
- `POST /api/refresh/` - Rafraîchir le token
- `GET /api/accounts/users/` - Liste des utilisateurs (admin)
- `POST /api/accounts/users/` - Créer un utilisateur (admin)
- `GET /api/accounts/users/{id}/` - Détails d'un utilisateur
- `PUT /api/accounts/users/{id}/` - Modifier un utilisateur
- `DELETE /api/accounts/users/{id}/` - Supprimer un utilisateur
- `GET /api/accounts/accounts/` - Liste des comptes
- `POST /api/accounts/accounts/` - Créer un compte
- `GET /api/accounts/accounts/{id}/` - Détails d'un compte
- `PUT /api/accounts/accounts/{id}/` - Modifier un compte
- `DELETE /api/accounts/accounts/{id}/` - Supprimer un compte

### 2. 📖 Cours (`/api/courses/`)

#### Frontend (Lecture seule)
- `GET /api/courses/categories/` - Liste des catégories
- `GET /api/courses/categories/{id}/` - Détails d'une catégorie
- `GET /api/courses/courses/` - Liste des cours
- `GET /api/courses/courses/{id}/` - Détails d'un cours
- `GET /api/courses/lessons/` - Liste des leçons
- `GET /api/courses/lessons/{id}/` - Détails d'une leçon
- `GET /api/courses/enrollments/` - Mes inscriptions
- `POST /api/courses/enrollments/` - S'inscrire à un cours
- `GET /api/courses/favorites/` - Mes favoris
- `POST /api/courses/favorites/` - Ajouter un favori
- `DELETE /api/courses/favorites/{id}/` - Retirer un favori

#### Administration (CRUD complet)
- `GET /api/courses/admin/categories/` - Liste des catégories (admin)
- `POST /api/courses/admin/categories/` - Créer une catégorie
- `GET /api/courses/admin/categories/{id}/` - Détails d'une catégorie
- `PUT /api/courses/admin/categories/{id}/` - Modifier une catégorie
- `DELETE /api/courses/admin/categories/{id}/` - Supprimer une catégorie
- `GET /api/courses/admin/courses/` - Liste des cours (admin)
- `POST /api/courses/admin/courses/` - Créer un cours
- `GET /api/courses/admin/courses/{id}/` - Détails d'un cours
- `PUT /api/courses/admin/courses/{id}/` - Modifier un cours
- `DELETE /api/courses/admin/courses/{id}/` - Supprimer un cours
- `GET /api/courses/admin/lessons/` - Liste des leçons (admin)
- `POST /api/courses/admin/lessons/` - Créer une leçon
- `GET /api/courses/admin/lessons/{id}/` - Détails d'une leçon
- `PUT /api/courses/admin/lessons/{id}/` - Modifier une leçon
- `DELETE /api/courses/admin/lessons/{id}/` - Supprimer une leçon

### 3. 📖 Sermons (`/api/sermons/`)

#### Frontend (Lecture seule)
- `GET /api/sermons/categories/` - Liste des catégories
- `GET /api/sermons/categories/{id}/` - Détails d'une catégorie
- `GET /api/sermons/` - Liste des sermons
- `GET /api/sermons/{id}/` - Détails d'un sermon

#### Administration (CRUD complet)
- `GET /api/admin/sermons/sermons/` - Liste des sermons (admin)
- `POST /api/admin/sermons/sermons/` - Créer un sermon
- `GET /api/admin/sermons/sermons/{id}/` - Détails d'un sermon
- `PUT /api/admin/sermons/sermons/{id}/` - Modifier un sermon
- `DELETE /api/admin/sermons/sermons/{id}/` - Supprimer un sermon

### 4. ⚙️ Paramètres (`/api/settings/`)

#### Frontend & Administration
- `GET /api/settings/current/` - Paramètres actuels (public)
- `GET /api/settings/` - Liste des paramètres (admin)
- `POST /api/settings/` - Créer des paramètres (admin)
- `GET /api/settings/{id}/` - Détails des paramètres
- `PUT /api/settings/{id}/` - Modifier les paramètres
- `DELETE /api/settings/{id}/` - Supprimer les paramètres

### 5. 🏪 Boutiques (`/api/shops/`)

#### Frontend
- `GET /api/shops/shops/` - Liste des boutiques
- `GET /api/shops/shops/{id}/` - Détails d'une boutique
- `GET /api/shops/products/` - Liste des produits
- `GET /api/shops/products/{id}/` - Détails d'un produit
- `GET /api/shops/categories/` - Liste des catégories
- `GET /api/shops/sub-categories/` - Liste des sous-catégories
- `GET /api/shops/provinces/` - Liste des provinces
- `GET /api/shops/history/` - Historique (si autorisé)

#### Administration (CRUD complet)
- `GET /api/admin/shops/shops/` - Liste des boutiques (admin)
- `POST /api/admin/shops/shops/` - Créer une boutique
- `GET /api/admin/shops/shops/{id}/` - Détails d'une boutique
- `PUT /api/admin/shops/shops/{id}/` - Modifier une boutique
- `DELETE /api/admin/shops/shops/{id}/` - Supprimer une boutique
- `GET /api/admin/shops/products/` - Liste des produits (admin)
- `POST /api/admin/shops/products/` - Créer un produit
- `GET /api/admin/shops/products/{id}/` - Détails d'un produit
- `PUT /api/admin/shops/products/{id}/` - Modifier un produit
- `DELETE /api/admin/shops/products/{id}/` - Supprimer un produit
- `GET /api/admin/shops/categories/` - Liste des catégories (admin)
- `POST /api/admin/shops/categories/` - Créer une catégorie
- `PUT /api/admin/shops/categories/{id}/` - Modifier une catégorie
- `DELETE /api/admin/shops/categories/{id}/` - Supprimer une catégorie
- `GET /api/admin/shops/sub-categories/` - Liste des sous-catégories (admin)
- `POST /api/admin/shops/sub-categories/` - Créer une sous-catégorie
- `PUT /api/admin/shops/sub-categories/{id}/` - Modifier une sous-catégorie
- `DELETE /api/admin/shops/sub-categories/{id}/` - Supprimer une sous-catégorie

## 🔒 Séparation Frontend / Administration

### Frontend
- **Accès** : Lecture seule pour la plupart des ressources
- **Authentification** : JWT token (obtenu via `/api/login/`)
- **Routes** : `/api/courses/`, `/api/sermons/`, `/api/settings/current/`, etc.

### Administration
- **Accès** : CRUD complet (Create, Read, Update, Delete)
- **Authentification** : JWT token avec permissions admin
- **Routes** : `/api/courses/admin/`, `/api/admin/sermons/`, `/api/admin/shops/`, etc.

## 📝 Exemples d'utilisation

### Frontend - Lire les cours

```typescript
// GET /api/courses/courses/
const response = await fetch('/api/courses/courses/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const courses = await response.json();
```

### Frontend - S'inscrire à un cours

```typescript
// POST /api/courses/enrollments/
const response = await fetch('http://10.10.107.14:8000/api/courses/enrollments/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    course: courseId
  })
});
```

### Administration - Créer un cours

```typescript
// POST /api/courses/admin/courses/
const response = await fetch('http://10.10.107.14:8000/api/courses/admin/courses/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Nouveau cours',
    description: 'Description...',
    category: categoryId,
    // ... autres champs
  })
});
```

### Administration - Modifier un cours

```typescript
// PUT /api/courses/admin/courses/{id}/
const response = await fetch(`http://10.10.107.14:8000/api/courses/admin/courses/${courseId}/`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Titre modifié',
    // ... autres champs à modifier
  })
});
```

### Administration - Supprimer un cours

```typescript
// DELETE /api/courses/admin/courses/{id}/
const response = await fetch(`http://10.10.107.14:8000/api/courses/admin/courses/${courseId}/`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
```

## ✅ Garanties de l'Architecture

1. **Aucun accès direct à la base de données** : Le frontend et l'administration n'accèdent jamais directement à la base de données
2. **Toutes les opérations passent par l'API** : CRUD complet via endpoints REST
3. **Authentification obligatoire** : Toutes les routes (sauf login/register) nécessitent un token JWT
4. **Séparation des permissions** : Routes frontend (lecture) vs routes admin (CRUD)
5. **Validation centralisée** : Toute la logique métier est dans les ViewSets Django
6. **Cohérence** : Même API utilisée en local et en production

## 🔄 Workflow Type

### Création d'une ressource (Admin)
1. Frontend admin fait `POST /api/{module}/admin/{resource}/`
2. ViewSet Django valide les données
3. ViewSet crée l'objet dans la base de données
4. ViewSet retourne la réponse JSON
5. Frontend affiche le résultat

### Lecture d'une ressource (Frontend)
1. Frontend fait `GET /api/{module}/{resource}/`
2. ViewSet Django récupère les données depuis la base
3. ViewSet sérialise les données
4. ViewSet retourne la réponse JSON
5. Frontend affiche les données

### Modification d'une ressource (Admin)
1. Frontend admin fait `PUT /api/{module}/admin/{resource}/{id}/`
2. ViewSet Django valide les données
3. ViewSet met à jour l'objet dans la base de données
4. ViewSet retourne la réponse JSON
5. Frontend affiche le résultat

### Suppression d'une ressource (Admin)
1. Frontend admin fait `DELETE /api/{module}/admin/{resource}/{id}/`
2. ViewSet Django supprime l'objet de la base de données
3. ViewSet retourne une réponse de succès
4. Frontend met à jour l'interface

## 📊 Structure des Réponses API

### Succès (200 OK)
```json
{
  "id": 1,
  "title": "Titre",
  "description": "Description",
  // ... autres champs
}
```

### Liste (200 OK)
```json
{
  "count": 10,
  "next": "http://.../api/courses/courses/?page=2",
  "previous": null,
  "results": [
    { "id": 1, "title": "Cours 1", ... },
    { "id": 2, "title": "Cours 2", ... }
  ]
}
```

### Erreur (400/401/403/404/500)
```json
{
  "detail": "Message d'erreur",
  // ou
  "error": "Champ spécifique",
  "message": "Détails de l'erreur"
}
```

## 🚫 Ce qui N'EST PAS autorisé

- ❌ Accès direct à la base de données depuis le frontend
- ❌ Requêtes SQL directes depuis le frontend
- ❌ Modification des données sans passer par l'API
- ❌ Utilisation de l'admin Django pour les opérations normales (réservé au super-admin)
- ❌ Bypass de l'authentification

## ✅ Ce qui EST autorisé

- ✅ Toutes les opérations via les endpoints API REST
- ✅ Authentification JWT pour sécuriser les accès
- ✅ Utilisation de l'admin Django uniquement pour la gestion système (super-admin)
- ✅ Synchronisation manuelle via `sync_local_to_prod.py` (hors API normale)

## 📚 Documentation Complémentaire

- **Guide de synchronisation** : `SYNC_README.md`
- **Dépannage** : `TROUBLESHOOTING.md`
- **Changelog** : `CHANGELOG_SYNC.md`

