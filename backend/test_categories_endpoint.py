#!/usr/bin/env python
"""
Script de test simple pour l'endpoint /api/courses/categories/
"""
import os
import sys
import django

# Configuration du chemin Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')

try:
    django.setup()
except Exception as e:
    print(f"ERREUR lors de l'initialisation de Django: {e}")
    sys.exit(1)

from django.test import RequestFactory
from api.courses.viewsets.category import CourseCategoryViewSet
from api.courses.models import CourseCategory
from api.courses.serializers.category import CourseCategorySerializer

print("=" * 60)
print("TEST DE L'ENDPOINT /api/courses/categories/")
print("=" * 60)

factory = RequestFactory()

# Test 1: Vérifier que le modèle existe
print("\n1. Verification du modele CourseCategory...")
try:
    count = CourseCategory.objects.count()
    print(f"   OK - Nombre de categories: {count}")
    
    if count == 0:
        print("   ATTENTION - Aucune categorie trouvee")
    else:
        category = CourseCategory.objects.first()
        print(f"   OK - Premiere categorie trouvee: {category.name} (slug: {category.slug})")
except Exception as e:
    print(f"   ERREUR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 2: Tester le serializer
print("\n2. Test du serializer CourseCategorySerializer...")
try:
    if CourseCategory.objects.exists():
        category = CourseCategory.objects.first()
        serializer = CourseCategorySerializer(category, context={'request': None})
        data = serializer.data
        print(f"   OK - Serialization reussie")
        print(f"   - Donnees: {data}")
    else:
        print("   ATTENTION - Aucune categorie a serialiser")
except Exception as e:
    print(f"   ERREUR lors de la serialisation: {e}")
    import traceback
    traceback.print_exc()

# Test 3: Tester la vue avec une requête
print("\n3. Test de la vue CourseCategoryViewSet...")
try:
    view = CourseCategoryViewSet()
    request = factory.get('/api/courses/categories/')
    request.META['SERVER_NAME'] = 'localhost'
    request.META['SERVER_PORT'] = '8000'
    
    response = view.list(request)
    print(f"   OK - Response status: {response.status_code}")
    
    if response.status_code == 200:
        print(f"   OK - Donnees retournees: {len(response.data)} categories")
        if response.data:
            print(f"   - Premiere categorie: {response.data[0]}")
    else:
        print(f"   ERREUR - Response data: {response.data}")
        
except Exception as e:
    print(f"   ERREUR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("TESTS TERMINES")
print("=" * 60)

