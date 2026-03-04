#!/usr/bin/env python
"""
Script de test pour les endpoints API qui retournent 500
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
from api.courses.viewsets.course import CourseViewSet
from api.courses.viewsets.category import CourseCategoryViewSet
from api.courses.models import Course, CourseCategory
from api.courses.serializers.course import CourseSerializer
from api.courses.serializers.category import CourseCategorySerializer

print("=" * 60)
print("TEST DES ENDPOINTS API")
print("=" * 60)

factory = RequestFactory()

# Test 1: CourseCategoryViewSet
print("\n1. Test CourseCategoryViewSet...")
try:
    viewset = CourseCategoryViewSet()
    viewset.request = factory.get('/api/courses/categories/')
    viewset.format_kwarg = None
    
    # Tester le queryset
    queryset = viewset.get_queryset()
    print(f"   OK - Queryset accessible: {queryset.count()} categories")
    
    # Tester la sérialisation
    if queryset.exists():
        category = queryset.first()
        serializer = CourseCategorySerializer(category)
        data = serializer.data
        print(f"   OK - Serialization reussie: {data.get('name', 'N/A')}")
    else:
        print("   ATTENTION - Aucune categorie dans la base de donnees")
    
    # Tester la vue list
    response = viewset.list(viewset.request)
    print(f"   OK - Response status: {response.status_code}")
    if response.status_code != 200:
        print(f"   ERREUR - Response data: {response.data}")
        
except Exception as e:
    print(f"   ERREUR: {e}")
    import traceback
    traceback.print_exc()

# Test 2: CourseViewSet
print("\n2. Test CourseViewSet...")
try:
    viewset = CourseViewSet()
    viewset.request = factory.get('/api/courses/courses/')
    viewset.format_kwarg = None
    
    # Tester le queryset
    queryset = viewset.get_queryset()
    print(f"   OK - Queryset accessible: {queryset.count()} cours actifs")
    
    # Tester la sérialisation de chaque cours
    if queryset.exists():
        for course in queryset[:3]:  # Tester les 3 premiers
            try:
                serializer = CourseSerializer(course, context={'request': viewset.request})
                data = serializer.data
                print(f"   OK - Serialization reussie pour: {course.title}")
            except Exception as ser_error:
                print(f"   ERREUR - Serialization echouee pour {course.title}: {ser_error}")
                import traceback
                traceback.print_exc()
    else:
        print("   ATTENTION - Aucun cours actif dans la base de donnees")
    
    # Tester la vue list
    response = viewset.list(viewset.request)
    print(f"   OK - Response status: {response.status_code}")
    if response.status_code != 200:
        print(f"   ERREUR - Response data: {response.data}")
        
except Exception as e:
    print(f"   ERREUR: {e}")
    import traceback
    traceback.print_exc()

# Test 3: Vérifier les fichiers média
print("\n3. Verification des fichiers media...")
try:
    courses_with_images = Course.objects.exclude(image='').exclude(image=None)
    print(f"   - Cours avec images: {courses_with_images.count()}")
    
    for course in courses_with_images[:5]:
        try:
            if hasattr(course.image, 'url'):
                image_url = course.image.url
                print(f"   OK - {course.title}: {image_url}")
            else:
                print(f"   ATTENTION - {course.title}: image sans attribut url")
        except Exception as e:
            print(f"   ERREUR - {course.title}: {e}")
            
except Exception as e:
    print(f"   ERREUR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("TESTS TERMINES")
print("=" * 60)

