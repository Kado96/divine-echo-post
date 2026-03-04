"""
Script pour créer les données par défaut :
- Catégorie "Sélectionner une catégorie"
- SiteSettings par défaut
- Rendre un utilisateur admin (is_staff=True)
"""
import os
import sys
import django

# Configuration Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from django.contrib.auth.models import User
from api.courses.models import CourseCategory
from api.settings.models import SiteSettings


def create_default_category():
    """Créer la catégorie par défaut 'Sélectionner une catégorie'"""
    category, created = CourseCategory.objects.get_or_create(
        slug='selectionner-une-categorie',
        defaults={
            'name': 'Sélectionner une catégorie',
        }
    )
    if created:
        print(f"✅ Catégorie '{category.name}' créée avec succès")
    else:
        print(f"ℹ️  Catégorie '{category.name}' existe déjà")
    return category


def create_default_site_settings():
    """Créer les paramètres du site par défaut"""
    try:
        settings, created = SiteSettings.objects.get_or_create(
            pk=1,
            defaults={
                'site_name': 'Shalom Ministry',
                'description': 'Plateforme de formation chrétienne en ligne',
                'contact_email': 'contact@shalomministry.org',
                'contact_phone': '+257 79 000 000',
                'contact_address': 'Bujumbura, Burundi',
                'hero_title': 'Grandissez dans la foi',
                'hero_subtitle': 'Découvrez nos émissions, enseignements et temps de méditation pour approfondir votre relation avec Dieu.',
                'about_content': 'Bienvenue sur Shalom Ministry, une plateforme dédiée à la croissance spirituelle.',
                'contact_content': 'Contactez-nous pour toute question ou demande.',
            }
        )
        if created:
            print(f"✅ Paramètres du site créés avec succès")
        else:
            print(f"ℹ️  Paramètres du site existent déjà (ID: {settings.id})")
        return settings
    except Exception as e:
        print(f"❌ Erreur lors de la création des paramètres du site: {e}")
        # Essayer de récupérer l'instance existante
        try:
            settings = SiteSettings.objects.get(pk=1)
            print(f"ℹ️  Instance SiteSettings trouvée (ID: {settings.id})")
            return settings
        except SiteSettings.DoesNotExist:
            print(f"❌ Impossible de créer ou récupérer l'instance SiteSettings")
            raise


def make_user_admin(username):
    """Rendre un utilisateur admin (is_staff=True, is_superuser=True)"""
    try:
        user = User.objects.get(username=username)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"✅ Utilisateur '{username}' est maintenant admin (is_staff=True, is_superuser=True)")
        return user
    except User.DoesNotExist:
        print(f"❌ Utilisateur '{username}' n'existe pas")
        return None


if __name__ == '__main__':
    print("🚀 Création des données par défaut...\n")
    
    # Créer la catégorie par défaut
    create_default_category()
    
    # Créer les paramètres du site
    create_default_site_settings()
    
    # Rendre un utilisateur admin (remplacez 'papa' par votre username)
    username = input("\nEntrez le nom d'utilisateur à rendre admin (ou appuyez sur Entrée pour ignorer): ").strip()
    if username:
        make_user_admin(username)
    
    print("\n✅ Terminé!")

