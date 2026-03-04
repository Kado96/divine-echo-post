"""
Script pour vérifier et initialiser la base de données
Vérifie que toutes les migrations sont appliquées et que les données par défaut existent
"""
import os
import sys
import django

# Configuration Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from django.core.management import call_command
from api.settings.models import SiteSettings

def check_migrations():
    """Vérifier et appliquer les migrations"""
    print("🔄 Vérification des migrations...")
    try:
        call_command('migrate', verbosity=0, interactive=False)
        print("✅ Migrations à jour")
        return True
    except Exception as e:
        print(f"❌ Erreur lors des migrations: {e}")
        return False

def check_site_settings():
    """Vérifier et créer SiteSettings si nécessaire"""
    print("\n🔄 Vérification des paramètres du site...")
    try:
        settings = SiteSettings.objects.get(pk=1)
        print(f"✅ SiteSettings existe (ID: {settings.id}, Nom: {settings.site_name})")
        return True
    except SiteSettings.DoesNotExist:
        print("⚠️  SiteSettings n'existe pas, création...")
        try:
            settings = SiteSettings.objects.create(
                pk=1,
                site_name='Shalom Ministry',
                description='Plateforme de formation chrétienne en ligne',
                contact_email='contact@shalomministry.org',
                contact_phone='+257 79 000 000',
                contact_address='Bujumbura, Burundi',
                hero_title='Grandissez dans la foi',
                hero_subtitle='Découvrez nos émissions, enseignements et temps de méditation pour approfondir votre relation avec Dieu.',
                about_content='Bienvenue sur Shalom Ministry, une plateforme dédiée à la croissance spirituelle.',
                contact_content='Contactez-nous pour toute question ou demande.',
            )
            print(f"✅ SiteSettings créé avec succès (ID: {settings.id})")
            return True
        except Exception as e:
            print(f"❌ Erreur lors de la création de SiteSettings: {e}")
            return False

if __name__ == '__main__':
    print("=" * 60)
    print("🔍 Vérification et initialisation de la base de données")
    print("=" * 60)
    
    # Vérifier les migrations
    if not check_migrations():
        print("\n❌ Échec de la vérification des migrations")
        sys.exit(1)
    
    # Vérifier SiteSettings
    if not check_site_settings():
        print("\n❌ Échec de la vérification de SiteSettings")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ Base de données prête!")
    print("=" * 60)

