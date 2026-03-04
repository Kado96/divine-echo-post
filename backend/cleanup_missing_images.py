"""
Script pour nettoyer les références d'images manquantes dans la base de données.
Supprime les références aux fichiers images qui n'existent pas physiquement.
"""
import os
import sys
import django

# Configurer l'encodage UTF-8 pour la console Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from api.courses.models import Course
from django.core.files.storage import default_storage
from django.conf import settings


def cleanup_missing_images():
    """Nettoie les références d'images manquantes pour les cours"""
    print("=" * 80)
    print("Nettoyage des références d'images manquantes")
    print("=" * 80)
    print()
    
    # Récupérer tous les cours avec des images
    courses_with_images = Course.objects.exclude(image__isnull=True).exclude(image='')
    
    print(f"Nombre de cours avec des images référencées: {courses_with_images.count()}")
    print()
    
    cleaned_count = 0
    kept_count = 0
    errors = []
    
    for course in courses_with_images:
        try:
            image_path = str(course.image)
            
            # Vérifier si le fichier existe
            if image_path:
                # Vérifier avec le storage Django
                if default_storage.exists(image_path):
                    # Vérifier aussi dans le système de fichiers
                    media_root = getattr(settings, 'MEDIA_ROOT', None)
                    if media_root:
                        full_path = os.path.join(media_root, image_path)
                        if os.path.exists(full_path):
                            kept_count += 1
                            print(f"[OK] Garde: {course.title} -> {image_path}")
                            continue
                
                # Le fichier n'existe pas, supprimer la référence
                print(f"[SUPPRIME] {course.title} -> {image_path} (fichier manquant)")
                course.image = None
                course.save(update_fields=['image'])
                cleaned_count += 1
            else:
                # Image vide, nettoyer
                course.image = None
                course.save(update_fields=['image'])
                cleaned_count += 1
                
        except Exception as e:
            error_msg = f"Erreur pour le cours '{course.title}' (ID: {course.id}): {str(e)}"
            errors.append(error_msg)
            print(f"[ERREUR] {error_msg}")
    
    print()
    print("=" * 80)
    print("Resume du nettoyage")
    print("=" * 80)
    print(f"[OK] Images conservees: {kept_count}")
    print(f"[SUPPRIME] References supprimees: {cleaned_count}")
    print(f"[ERREUR] Erreurs: {len(errors)}")
    
    if errors:
        print()
        print("Erreurs rencontrées:")
        for error in errors:
            print(f"  - {error}")
    
    print()
    print("Nettoyage terminé!")
    return cleaned_count, kept_count, len(errors)


if __name__ == '__main__':
    try:
        cleaned, kept, error_count = cleanup_missing_images()
        sys.exit(0 if error_count == 0 else 1)
    except Exception as e:
        print(f"Erreur fatale: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

