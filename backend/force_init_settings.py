"""
Script pour forcer la création de l'instance SiteSettings
"""
import os
import sys
import django

# Configuration Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from django.db import transaction
from api.settings.models import SiteSettings
from django.core.cache import cache

def force_create_settings():
    """Forcer la création de l'instance SiteSettings"""
    print("Forçage de la creation de l'instance SiteSettings...")
    
    try:
        # Nettoyer le cache
        cache.delete('site_settings')
        
        # Supprimer l'instance existante si elle existe
        SiteSettings.objects.filter(pk=1).delete()
        
        # Créer une nouvelle instance
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
        
        print(f"✅ Instance SiteSettings créée avec succès (ID: {settings.id})")
        print(f"   Nom: {settings.site_name}")
        print(f"   Email: {settings.contact_email}")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        import traceback
        traceback.print_exc()
        
        # Essayer avec get_or_create
        try:
            settings, created = SiteSettings.objects.get_or_create(pk=1)
            print(f"✅ Instance SiteSettings récupérée/créée (ID: {settings.id}, Créée: {created})")
            return True
        except Exception as e2:
            print(f"❌ Erreur même avec get_or_create: {e2}")
            return False

if __name__ == '__main__':
    success = force_create_settings()
    sys.exit(0 if success else 1)

