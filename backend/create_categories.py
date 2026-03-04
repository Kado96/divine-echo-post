"""
Script pour créer des catégories de cours par défaut
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from api.courses.models import CourseCategory

def create_categories():
    """Créer les catégories par défaut"""
    categories_data = [
        {'name': 'Étude biblique', 'slug': 'etude-biblique', 'icon': '📖'},
        {'name': 'Prière et méditation', 'slug': 'priere-meditation', 'icon': '🙏'},
        {'name': 'Musique et adoration', 'slug': 'musique-adoration', 'icon': '🎵'},
        {'name': 'Théologie', 'slug': 'theologie', 'icon': '📚'},
        {'name': 'Vie de famille', 'slug': 'vie-famille', 'icon': '👨‍👩‍👧‍👦'},
        {'name': 'Leadership', 'slug': 'leadership', 'icon': '⭐'},
    ]
    
    created_count = 0
    updated_count = 0
    
    for cat_data in categories_data:
        category, created = CourseCategory.objects.get_or_create(
            slug=cat_data['slug'],
            defaults={
                'name': cat_data['name'],
                'icon': cat_data['icon'],
            }
        )
        
        if not created:
            # Mettre à jour si la catégorie existe déjà
            category.name = cat_data['name']
            category.icon = cat_data['icon']
            category.save()
            updated_count += 1
            print(f"OK Categorie mise a jour: {category.name}")
        else:
            created_count += 1
            print(f"OK Categorie creee: {category.name}")
    
    # Supprimer la catégorie "Sélectionner une catégorie" si elle existe
    try:
        bad_category = CourseCategory.objects.get(slug='selectionner-une-categorie')
        bad_category.delete()
        print(f"OK Categorie supprimee: {bad_category.name}")
    except CourseCategory.DoesNotExist:
        pass
    
    print(f"\nTermine! {created_count} categorie(s) creee(s), {updated_count} mise(s) a jour")
    print(f"Total de categories: {CourseCategory.objects.count()}")

if __name__ == '__main__':
    create_categories()

