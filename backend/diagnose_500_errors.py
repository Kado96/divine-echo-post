#!/usr/bin/env python
"""
Script de diagnostic pour les erreurs 500 de l'API
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

from django.conf import settings
from api.courses.models import Course, CourseCategory
from api.settings.models import SiteSettings

print("=" * 60)
print("DIAGNOSTIC DES ERREURS 500")
print("=" * 60)

# 1. Vérifier la base de données
print("\n1. Vérification de la base de données...")
try:
    course_count = Course.objects.count()
    category_count = CourseCategory.objects.count()
    settings_count = SiteSettings.objects.count()
    print(f"   OK - Base de donnees accessible")
    print(f"   - Cours: {course_count}")
    print(f"   - Categories: {category_count}")
    print(f"   - Parametres: {settings_count}")
except Exception as e:
    print(f"   ERREUR d'acces a la base de donnees: {e}")
    sys.exit(1)

# 2. Vérifier les settings
print("\n2. Vérification des paramètres du site...")
try:
    settings_obj = SiteSettings.objects.first()
    if not settings_obj:
        print("   ATTENTION - Aucun parametre trouve, creation...")
        settings_obj = SiteSettings.objects.create(
            pk=1,
            site_name='Shalom Ministry',
            description='Plateforme de formation chretienne en ligne',
        )
        print("   OK - Parametres crees")
    else:
        print(f"   OK - Parametres trouves (ID: {settings_obj.id})")
except Exception as e:
    print(f"   ERREUR avec les parametres: {e}")
    import traceback
    traceback.print_exc()

# 3. Vérifier les serializers
print("\n3. Vérification des serializers...")
try:
    from api.courses.serializers.course import CourseSerializer
    from api.courses.serializers.category import CourseCategorySerializer
    from api.settings.serializers import SiteSettingsSerializer
    
    # Tester avec un cours
    if course_count > 0:
        course = Course.objects.first()
        serializer = CourseSerializer(course, context={'request': None})
        data = serializer.data
        print(f"   OK - CourseSerializer fonctionne (cours: {course.title})")
    else:
        print("   ATTENTION - Aucun cours pour tester le serializer")
    
    # Tester avec une catégorie
    if category_count > 0:
        category = CourseCategory.objects.first()
        serializer = CourseCategorySerializer(category)
        data = serializer.data
        print(f"   OK - CourseCategorySerializer fonctionne (categorie: {category.name})")
    else:
        print("   ATTENTION - Aucune categorie pour tester le serializer")
    
    # Tester avec les settings
    serializer = SiteSettingsSerializer(settings_obj, context={'request': None})
    data = serializer.data
    print(f"   OK - SiteSettingsSerializer fonctionne")
    
except Exception as e:
    print(f"   ERREUR dans les serializers: {e}")
    import traceback
    traceback.print_exc()

# 4. Vérifier les fichiers média
print("\n4. Vérification des fichiers média...")
try:
    media_root = settings.MEDIA_ROOT
    media_url = settings.MEDIA_URL
    print(f"   - MEDIA_ROOT: {media_root}")
    print(f"   - MEDIA_URL: {media_url}")
    
    if os.path.exists(media_root):
        print(f"   OK - Repertoire media existe")
    else:
        print(f"   ATTENTION - Repertoire media n'existe pas: {media_root}")
        
    # Vérifier les images des cours
    courses_with_images = Course.objects.exclude(image='').exclude(image=None)
    print(f"   - Cours avec images: {courses_with_images.count()}")
    for course in courses_with_images[:3]:
        if course.image:
            try:
                image_path = os.path.join(media_root, course.image.name) if hasattr(course.image, 'name') else None
                if image_path and os.path.exists(image_path):
                    print(f"     OK - {course.title}: image existe")
                else:
                    print(f"     ATTENTION - {course.title}: image manquante ({course.image})")
            except Exception as e:
                print(f"     ERREUR - {course.title}: erreur verification image: {e}")
except Exception as e:
    print(f"   ERREUR lors de la verification des medias: {e}")
    import traceback
    traceback.print_exc()

# 5. Vérifier les URLs
print("\n5. Vérification des URLs...")
try:
    from django.urls import reverse
    from django.test import RequestFactory
    
    factory = RequestFactory()
    request = factory.get('/api/courses/courses/')
    request.META['SERVER_NAME'] = 'localhost'
    request.META['SERVER_PORT'] = '8000'
    
    print("   OK - Factory de requete cree")
except Exception as e:
    print(f"   ERREUR lors de la creation de la requete: {e}")

print("\n" + "=" * 60)
print("DIAGNOSTIC TERMINÉ")
print("=" * 60)
print("\nSi des erreurs apparaissent ci-dessus, corrigez-les avant de redémarrer le serveur.")
print("Pour voir les logs détaillés du serveur, vérifiez la console où Django tourne.")

