# 🔧 Guide de Maintenance de l'API

## 📋 Principes Fondamentaux

### ✅ À FAIRE

1. **Toutes les opérations passent par l'API REST**
   - Frontend → API → ViewSet → Base de données
   - Administration → API → ViewSet → Base de données

2. **Séparation Frontend/Admin**
   - Frontend : Routes `/api/{module}/` (lecture seule généralement)
   - Admin : Routes `/api/{module}/admin/` ou `/api/admin/{module}/` (CRUD complet)

3. **Utiliser Django REST Framework**
   - ViewSets pour les opérations CRUD standard
   - APIView pour les endpoints spécialisés
   - Serializers pour la validation et la sérialisation

4. **Authentification JWT**
   - Tous les endpoints (sauf login/register) nécessitent un token JWT
   - Utiliser `IsAuthenticated` pour les endpoints authentifiés
   - Utiliser `IsAdminOrSuperUser` pour les endpoints admin

5. **Permissions appropriées**
   - `AllowAny` : Endpoints publics (lecture)
   - `IsAuthenticated` : Endpoints nécessitant une authentification
   - `IsAdminOrSuperUser` : Endpoints admin

### ❌ À NE PAS FAIRE

1. **Accès direct à la base de données**
   ```python
   # ❌ INTERDIT
   from django.db import connection
   cursor = connection.cursor()
   cursor.execute("SELECT * FROM courses")
   ```

2. **Modification des données sans passer par l'API**
   ```python
   # ❌ INTERDIT dans les views frontend
   course = Course.objects.get(id=1)
   course.title = "Nouveau titre"
   course.save()  # Doit passer par l'API
   ```

3. **Utiliser l'admin Django pour les opérations normales**
   - L'admin Django (`/admin/`) est réservé à la gestion système uniquement
   - Toutes les opérations utilisateur doivent passer par l'API

## 🏗️ Structure d'un Module API

### Organisation des Fichiers

```
api/
└── {module}/
    ├── __init__.py
    ├── models.py              # Modèles Django
    ├── serializers.py         # Serializers DRF
    ├── viewsets/              # ViewSets organisés par ressource
    │   ├── __init__.py
    │   ├── resource.py        # ViewSet pour la ressource principale
    │   └── admin_resource.py  # ViewSet admin
    ├── urls.py                # Configuration des routes
    ├── admin.py               # Configuration admin Django (optionnel)
    └── tests.py               # Tests (optionnel)
```

### Exemple : Module Courses

```
api/courses/
├── models.py
├── serializers/
│   ├── __init__.py
│   ├── course.py
│   └── category.py
├── viewsets/
│   ├── __init__.py
│   ├── course.py              # CourseViewSet (frontend)
│   ├── admin_course.py        # AdminCourseViewSet (admin)
│   └── category.py            # CategoryViewSet
├── urls.py
└── admin.py
```

## 📝 Créer un Nouveau Endpoint

### Étape 1 : Créer le ViewSet

```python
# api/courses/viewsets/course.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from api.courses.models import Course
from api.courses.serializers import CourseSerializer

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les cours (lecture seule pour le frontend)
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]  # Ou AllowAny pour public
    lookup_field = 'slug'  # Utiliser slug au lieu de id
```

### Étape 2 : Créer le ViewSet Admin

```python
# api/courses/viewsets/admin_course.py
from rest_framework import viewsets
from api.accounts.viewsets.dependencies import IsAdminOrSuperUser
from api.courses.models import Course
from api.courses.serializers import CourseSerializer

class AdminCourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet admin pour les cours (CRUD complet)
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdminOrSuperUser]
```

### Étape 3 : Enregistrer dans urls.py

```python
# api/courses/urls.py
from django.urls import include, path
from rest_framework import routers
from api.courses.viewsets import CourseViewSet, AdminCourseViewSet

router = routers.DefaultRouter()
router.register(r"courses", CourseViewSet, basename="courses")
router.register(r"admin/courses", AdminCourseViewSet, basename="admin-courses")

urlpatterns = [
    path("", include(router.urls)),
]
```

### Étape 4 : Mettre à jour la Documentation

1. Ajouter l'endpoint dans `API_ARCHITECTURE.md`
2. Ajouter l'endpoint dans `API_IMPLEMENTATION_STATUS.md`
3. Ajouter des exemples dans `API_USAGE_GUIDE.md` si nécessaire

## 🔄 Modifier un Endpoint Existant

### Ajouter une Action Personnalisée

```python
from rest_framework.decorators import action
from rest_framework.response import Response

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    # ... code existant ...
    
    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """
        Action personnalisée : S'inscrire à un cours
        POST /api/courses/courses/{id}/enroll/
        """
        course = self.get_object()
        # Logique d'inscription
        return Response({'status': 'enrolled'})
```

### Modifier les Permissions

```python
from rest_framework.permissions import AllowAny, IsAuthenticated

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    # ... code existant ...
    
    def get_permissions(self):
        """
        Permissions dynamiques selon l'action
        """
        if self.action == 'list':
            return [AllowAny()]  # Liste publique
        return [IsAuthenticated()]  # Détails authentifiés
```

## 🧪 Tester un Endpoint

### Test Manuel avec curl

```bash
# GET (lecture)
curl -X GET http://localhost:8080/api/courses/courses/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# POST (création)
curl -X POST http://10.10.107.14:8000/api/courses/admin/courses/ \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Nouveau cours", "description": "..."}'

# PUT (modification)
curl -X PUT http://10.10.107.14:8000/api/courses/admin/courses/1/ \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Titre modifié"}'

# DELETE (suppression)
curl -X DELETE http://10.10.107.14:8000/api/courses/admin/courses/1/ \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Test avec Python

```python
import requests

# Obtenir un token
response = requests.post('http://localhost:8080/api/login/', {
    'username': 'admin',
    'password': 'password'
})
token = response.json()['access']

# Utiliser le token
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# GET
response = requests.get(
    'http://localhost:8080/api/courses/courses/',
    headers=headers
)
print(response.json())
```

## 🔍 Déboguer un Endpoint

### Vérifier les Logs Django

```python
import logging
logger = logging.getLogger(__name__)

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    def list(self, request, *args, **kwargs):
        logger.info(f"Liste des cours demandée par {request.user}")
        return super().list(request, *args, **kwargs)
```

### Vérifier les Permissions

```python
from rest_framework.exceptions import PermissionDenied

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Authentification requise")
        return Course.objects.all()
```

## 📚 Ressources

- **Django REST Framework** : https://www.django-rest-framework.org/
- **JWT Authentication** : https://django-rest-framework-simplejwt.readthedocs.io/
- **Documentation du projet** :
  - `API_ARCHITECTURE.md` : Architecture complète
  - `API_PRINCIPLES.md` : Principes fondamentaux
  - `API_USAGE_GUIDE.md` : Guide d'utilisation
  - `API_IMPLEMENTATION_STATUS.md` : État d'implémentation

## ✅ Checklist de Maintenance

Avant de déployer une modification :

- [ ] Tous les endpoints sont documentés dans `API_ARCHITECTURE.md`
- [ ] Les permissions sont correctement configurées
- [ ] Les ViewSets utilisent l'ORM Django (pas de SQL direct)
- [ ] Les serializers valident correctement les données
- [ ] Les tests passent (si disponibles)
- [ ] La documentation est à jour
- [ ] Les routes sont enregistrées dans `urls.py`
- [ ] La séparation Frontend/Admin est respectée

