# 📋 Liste Complète des Endpoints API

## 🔍 Génération

Cette liste est générée automatiquement à partir de la structure du projet.
Pour la régénérer, exécutez :
```bash
python validate_api_structure.py
```

## 📚 Endpoints par Module

### 🔐 Authentification (`/api/accounts/`)

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| `POST` | `/api/login/` | Connexion (obtient token JWT) | Public |
| `POST` | `/api/register/` | Inscription | Public |
| `POST` | `/api/refresh/` | Rafraîchir le token | Authentifié |
| `GET` | `/api/accounts/users/` | Liste des utilisateurs | Admin |
| `POST` | `/api/accounts/users/` | Créer un utilisateur | Admin |
| `GET` | `/api/accounts/users/{id}/` | Détails d'un utilisateur | Admin |
| `PUT` | `/api/accounts/users/{id}/` | Modifier un utilisateur | Admin |
| `PATCH` | `/api/accounts/users/{id}/` | Modifier partiellement | Admin |
| `DELETE` | `/api/accounts/users/{id}/` | Supprimer un utilisateur | Admin |
| `GET` | `/api/accounts/accounts/` | Liste des comptes | Authentifié |
| `POST` | `/api/accounts/accounts/` | Créer un compte | Authentifié |
| `GET` | `/api/accounts/accounts/{id}/` | Détails d'un compte | Authentifié |
| `PUT` | `/api/accounts/accounts/{id}/` | Modifier un compte | Authentifié |
| `PATCH` | `/api/accounts/accounts/{id}/` | Modifier partiellement | Authentifié |
| `DELETE` | `/api/accounts/accounts/{id}/` | Supprimer un compte | Authentifié |

### 📖 Cours (`/api/courses/`)

#### Frontend (Lecture)

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| `GET` | `/api/courses/categories/` | Liste des catégories | Public |
| `GET` | `/api/courses/categories/{slug}/` | Détails d'une catégorie | Public |
| `GET` | `/api/courses/courses/` | Liste des cours | Public |
| `GET` | `/api/courses/courses/{slug}/` | Détails d'un cours | Public |
| `GET` | `/api/courses/lessons/` | Liste des leçons | Public |
| `GET` | `/api/courses/lessons/{id}/` | Détails d'une leçon | Public |
| `GET` | `/api/courses/enrollments/` | Mes inscriptions | Authentifié |
| `POST` | `/api/courses/enrollments/` | S'inscrire à un cours | Authentifié |
| `GET` | `/api/courses/enrollments/{id}/` | Détails d'une inscription | Authentifié |
| `PUT` | `/api/courses/enrollments/{id}/` | Modifier une inscription | Authentifié |
| `POST` | `/api/courses/enrollments/{id}/complete-lesson/` | Marquer une leçon comme complétée | Authentifié |
| `GET` | `/api/courses/favorites/` | Mes favoris | Authentifié |
| `POST` | `/api/courses/favorites/` | Ajouter un favori | Authentifié |
| `GET` | `/api/courses/favorites/check/` | Vérifier si un contenu est favori | Authentifié |
| `POST` | `/api/courses/favorites/toggle/` | Toggle favori | Authentifié |
| `DELETE` | `/api/courses/favorites/{id}/` | Retirer un favori | Authentifié |

#### Administration (CRUD)

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| `GET` | `/api/courses/admin/categories/` | Liste des catégories | Admin |
| `POST` | `/api/courses/admin/categories/` | Créer une catégorie | Admin |
| `GET` | `/api/courses/admin/categories/{slug}/` | Détails d'une catégorie | Admin |
| `PUT` | `/api/courses/admin/categories/{slug}/` | Modifier une catégorie | Admin |
| `PATCH` | `/api/courses/admin/categories/{slug}/` | Modifier partiellement | Admin |
| `DELETE` | `/api/courses/admin/categories/{slug}/` | Supprimer une catégorie | Admin |
| `GET` | `/api/courses/admin/courses/` | Liste des cours | Admin |
| `POST` | `/api/courses/admin/courses/` | Créer un cours | Admin |
| `GET` | `/api/courses/admin/courses/{id}/` | Détails d'un cours | Admin |
| `PUT` | `/api/courses/admin/courses/{id}/` | Modifier un cours | Admin |
| `PATCH` | `/api/courses/admin/courses/{id}/` | Modifier partiellement | Admin |
| `DELETE` | `/api/courses/admin/courses/{id}/` | Supprimer un cours | Admin |
| `GET` | `/api/courses/admin/lessons/` | Liste des leçons | Admin |
| `POST` | `/api/courses/admin/lessons/` | Créer une leçon | Admin |
| `GET` | `/api/courses/admin/lessons/{id}/` | Détails d'une leçon | Admin |
| `PUT` | `/api/courses/admin/lessons/{id}/` | Modifier une leçon | Admin |
| `PATCH` | `/api/courses/admin/lessons/{id}/` | Modifier partiellement | Admin |
| `DELETE` | `/api/courses/admin/lessons/{id}/` | Supprimer une leçon | Admin |

### 📖 Sermons (`/api/sermons/`)

#### Frontend (Lecture)

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| `GET` | `/api/sermons/categories/` | Liste des catégories | Public |
| `GET` | `/api/sermons/categories/{slug}/` | Détails d'une catégorie | Public |
| `GET` | `/api/sermons/` | Liste des sermons | Public |
| `GET` | `/api/sermons/{slug}/` | Détails d'un sermon | Public |
| `POST` | `/api/sermons/{slug}/increment_views/` | Incrémenter les vues | Public |

#### Administration (CRUD)

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| `GET` | `/api/admin/sermons/sermons/` | Liste des sermons | Admin |
| `POST` | `/api/admin/sermons/sermons/` | Créer un sermon | Admin |
| `GET` | `/api/admin/sermons/sermons/{id}/` | Détails d'un sermon | Admin |
| `PUT` | `/api/admin/sermons/sermons/{id}/` | Modifier un sermon | Admin |
| `PATCH` | `/api/admin/sermons/sermons/{id}/` | Modifier partiellement | Admin |
| `DELETE` | `/api/admin/sermons/sermons/{id}/` | Supprimer un sermon | Admin |

### ⚙️ Paramètres (`/api/settings/`)

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| `GET` | `/api/settings/current/` | Paramètres actuels | Public |
| `GET` | `/api/settings/` | Liste des paramètres | Public (lecture) |
| `POST` | `/api/settings/` | Créer des paramètres | Admin |
| `GET` | `/api/settings/{id}/` | Détails des paramètres | Public |
| `PUT` | `/api/settings/{id}/` | Modifier les paramètres | Admin |
| `PATCH` | `/api/settings/{id}/` | Modifier partiellement | Admin |
| `DELETE` | `/api/settings/{id}/` | Supprimer les paramètres | Admin |

### 🏪 Boutiques (`/api/shops/`)

#### Frontend

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| `GET` | `/api/shops/shops/` | Liste des boutiques | Authentifié |
| `POST` | `/api/shops/shops/` | Créer une boutique | Authentifié |
| `GET` | `/api/shops/shops/{id}/` | Détails d'une boutique | Authentifié |
| `PUT` | `/api/shops/shops/{id}/` | Modifier une boutique | Authentifié |
| `DELETE` | `/api/shops/shops/{id}/` | Supprimer une boutique | Authentifié |
| `GET` | `/api/shops/products/` | Liste des produits | Authentifié |
| `POST` | `/api/shops/products/` | Créer un produit | Authentifié |
| `GET` | `/api/shops/products/{id}/` | Détails d'un produit | Authentifié |
| `PUT` | `/api/shops/products/{id}/` | Modifier un produit | Authentifié |
| `DELETE` | `/api/shops/products/{id}/` | Supprimer un produit | Authentifié |
| `GET` | `/api/shops/categories/` | Liste des catégories | Authentifié |
| `GET` | `/api/shops/sub-categories/` | Liste des sous-catégories | Authentifié |
| `GET` | `/api/shops/provinces/` | Liste des provinces | Authentifié |
| `GET` | `/api/shops/history/` | Historique | Authentifié |

#### Administration (CRUD)

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| `GET` | `/api/admin/shops/shops/` | Liste des boutiques | Admin |
| `POST` | `/api/admin/shops/shops/` | Créer une boutique | Admin |
| `GET` | `/api/admin/shops/shops/{id}/` | Détails d'une boutique | Admin |
| `PUT` | `/api/admin/shops/shops/{id}/` | Modifier une boutique | Admin |
| `DELETE` | `/api/admin/shops/shops/{id}/` | Supprimer une boutique | Admin |
| `GET` | `/api/admin/shops/products/` | Liste des produits | Admin |
| `POST` | `/api/admin/shops/products/` | Créer un produit | Admin |
| `GET` | `/api/admin/shops/products/{id}/` | Détails d'un produit | Admin |
| `PUT` | `/api/admin/shops/products/{id}/` | Modifier un produit | Admin |
| `DELETE` | `/api/admin/shops/products/{id}/` | Supprimer un produit | Admin |
| `GET` | `/api/admin/shops/categories/` | Liste des catégories | Admin |
| `POST` | `/api/admin/shops/categories/` | Créer une catégorie | Admin |
| `PUT` | `/api/admin/shops/categories/{id}/` | Modifier une catégorie | Admin |
| `DELETE` | `/api/admin/shops/categories/{id}/` | Supprimer une catégorie | Admin |
| `GET` | `/api/admin/shops/sub-categories/` | Liste des sous-catégories | Admin |
| `POST` | `/api/admin/shops/sub-categories/` | Créer une sous-catégorie | Admin |
| `PUT` | `/api/admin/shops/sub-categories/{id}/` | Modifier une sous-catégorie | Admin |
| `DELETE` | `/api/admin/shops/sub-categories/{id}/` | Supprimer une sous-catégorie | Admin |

## 🔑 Légende des Permissions

- **Public** : Aucune authentification requise
- **Authentifié** : Token JWT requis
- **Admin** : Token JWT + permissions admin requises

## 📝 Notes

1. Tous les endpoints utilisent l'authentification JWT (sauf login/register)
2. Les endpoints admin nécessitent des permissions admin
3. Les endpoints frontend sont généralement en lecture seule
4. Toutes les opérations passent par l'API REST (pas d'accès direct à la DB)

## 🔄 Mise à jour

Pour mettre à jour cette liste, exécutez :
```bash
python validate_api_structure.py
```

