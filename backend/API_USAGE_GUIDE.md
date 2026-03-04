# 📘 Guide d'Utilisation de l'API

## 🎯 Principe Fondamental

**TOUTES les opérations sur les données doivent passer par l'API REST.**
- ✅ Frontend → API → Base de données
- ✅ Administration → API → Base de données
- ❌ Frontend → Base de données (interdit)
- ❌ Administration → Base de données directe (interdit, sauf super-admin système)

## 🔑 Authentification

### 1. Obtenir un token JWT

```typescript
// POST /api/login/
const response = await fetch('/api/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'votre_username',
    password: 'votre_password'
  })
});

const data = await response.json();
const token = data.access; // Token JWT
const refreshToken = data.refresh; // Token de rafraîchissement
```

### 2. Utiliser le token dans les requêtes

```typescript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

## 📖 Opérations CRUD via l'API

### CREATE (Créer)

```typescript
// Exemple : Créer un cours (Admin)
const response = await fetch('http://10.10.107.14:8000/api/courses/admin/courses/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Nouveau cours',
    description: 'Description du cours',
    category: 1, // ID de la catégorie
    language: 'fr',
    instructor_name: 'Nom de l\'instructeur',
    // ... autres champs requis
  })
});

const newCourse = await response.json();
```

### READ (Lire)

```typescript
// Exemple : Lire la liste des cours (Frontend)
const response = await fetch('http://10.10.107.14:8000/api/courses/courses/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
// data.results contient la liste des cours
// data.count contient le nombre total
// data.next contient l'URL de la page suivante
```

```typescript
// Exemple : Lire un cours spécifique (Frontend)
const response = await fetch('http://10.10.107.14:8000/api/courses/courses/mon-cours-slug/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const course = await response.json();
```

### UPDATE (Modifier)

```typescript
// Exemple : Modifier un cours (Admin)
const response = await fetch('http://10.10.107.14:8000/api/courses/admin/courses/1/', {
  method: 'PUT', // ou PATCH pour modification partielle
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Titre modifié',
    description: 'Nouvelle description',
    // ... autres champs à modifier
  })
});

const updatedCourse = await response.json();
```

### DELETE (Supprimer)

```typescript
// Exemple : Supprimer un cours (Admin)
const response = await fetch('http://10.10.107.14:8000/api/courses/admin/courses/1/', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

if (response.ok) {
  console.log('Cours supprimé avec succès');
}
```

## 🎨 Exemples par Module

### Cours

#### Frontend - Lire les cours
```typescript
GET /api/courses/courses/
GET /api/courses/courses/{slug}/
GET /api/courses/categories/
GET /api/courses/lessons/
```

#### Administration - Gérer les cours
```typescript
// Créer
POST /api/courses/admin/courses/

// Lire
GET /api/courses/admin/courses/
GET /api/courses/admin/courses/{id}/

// Modifier
PUT /api/courses/admin/courses/{id}/
PATCH /api/courses/admin/courses/{id}/

// Supprimer
DELETE /api/courses/admin/courses/{id}/
```

### Sermons

#### Frontend - Lire les sermons
```typescript
GET /api/sermons/
GET /api/sermons/{slug}/
GET /api/sermons/categories/
```

#### Administration - Gérer les sermons
```typescript
POST /api/admin/sermons/sermons/
GET /api/admin/sermons/sermons/
GET /api/admin/sermons/sermons/{id}/
PUT /api/admin/sermons/sermons/{id}/
DELETE /api/admin/sermons/sermons/{id}/
```

### Boutiques

#### Frontend - Lire les boutiques
```typescript
GET /api/shops/shops/
GET /api/shops/products/
GET /api/shops/categories/
```

#### Administration - Gérer les boutiques
```typescript
POST /api/admin/shops/shops/
GET /api/admin/shops/shops/
PUT /api/admin/shops/shops/{id}/
DELETE /api/admin/shops/shops/{id}/
```

## 🔐 Permissions

### Frontend (Utilisateur normal)
- ✅ Lecture des ressources publiques
- ✅ Création de ses propres ressources (enrollments, favorites)
- ❌ Modification des ressources système
- ❌ Suppression des ressources système

### Administration (Admin)
- ✅ Lecture de toutes les ressources
- ✅ Création de toutes les ressources
- ✅ Modification de toutes les ressources
- ✅ Suppression de toutes les ressources

## 📋 Checklist pour les Développeurs Frontend

Avant d'implémenter une fonctionnalité, vérifiez :

- [ ] L'endpoint API existe pour cette opération
- [ ] J'ai le bon token JWT (frontend ou admin selon le besoin)
- [ ] J'utilise la bonne méthode HTTP (GET, POST, PUT, DELETE)
- [ ] J'envoie les données au bon format (JSON)
- [ ] Je gère les erreurs de l'API (400, 401, 403, 404, 500)
- [ ] Je n'accède JAMAIS directement à la base de données

## 📋 Checklist pour les Développeurs Backend

Lors de l'ajout d'une nouvelle fonctionnalité :

- [ ] J'ai créé un ViewSet pour cette ressource
- [ ] J'ai créé les routes API (frontend et admin si nécessaire)
- [ ] J'ai configuré les permissions appropriées
- [ ] J'ai créé les serializers nécessaires
- [ ] J'ai testé toutes les opérations CRUD
- [ ] J'ai documenté les endpoints dans `API_ARCHITECTURE.md`

## 🚫 Erreurs Courantes à Éviter

### ❌ Accès direct à la base de données depuis le frontend
```typescript
// MAUVAIS - Ne jamais faire ça
const db = openDatabase('...');
db.executeSql('SELECT * FROM courses', ...);
```

### ✅ Utiliser l'API
```typescript
// BON - Utiliser l'API
const response = await fetch('/api/courses/courses/');
const courses = await response.json();
```

### ❌ Modifier les données sans passer par l'API
```typescript
// MAUVAIS
localStorage.setItem('courses', JSON.stringify(modifiedCourses));
```

### ✅ Modifier via l'API
```typescript
// BON
await fetch('/api/courses/admin/courses/1/', {
  method: 'PUT',
  body: JSON.stringify(modifiedCourse)
});
```

## 🔄 Workflow Complet

### Scénario : Créer un nouveau cours depuis l'administration

1. **Frontend** : L'utilisateur remplit le formulaire
2. **Frontend** : Envoie `POST /api/courses/admin/courses/` avec les données
3. **Backend** : Le ViewSet `AdminCourseViewSet` reçoit la requête
4. **Backend** : Le serializer valide les données
5. **Backend** : Le ViewSet crée l'objet dans la base de données
6. **Backend** : Le ViewSet retourne la réponse JSON
7. **Frontend** : Affiche le résultat à l'utilisateur

### Scénario : Afficher les cours sur le frontend

1. **Frontend** : Envoie `GET /api/courses/courses/`
2. **Backend** : Le ViewSet `CourseViewSet` récupère les cours actifs
3. **Backend** : Le serializer formate les données
4. **Backend** : Le ViewSet retourne la réponse JSON paginée
5. **Frontend** : Affiche les cours à l'utilisateur

## 📚 Ressources

- **Architecture complète** : `API_ARCHITECTURE.md`
- **Dépannage** : `TROUBLESHOOTING.md`
- **Synchronisation** : `SYNC_README.md`

