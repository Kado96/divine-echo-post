"""
Script de diagnostic pour vérifier l'état de la base de données
"""
import os
import sys
import django

# Configuration Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from django.db import connection
from api.settings.models import SiteSettings
from django.contrib.auth.models import User

def check_database():
    """Vérifier l'état de la base de données"""
    print("🔍 Vérification de la base de données...\n")
    
    # Vérifier la connexion
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✅ Connexion à la base de données OK")
    except Exception as e:
        print(f"❌ Erreur de connexion à la base de données: {e}")
        return False
    
    # Vérifier SiteSettings
    try:
        settings_count = SiteSettings.objects.count()
        print(f"ℹ️  Nombre d'instances SiteSettings: {settings_count}")
        
        if settings_count == 0:
            print("⚠️  Aucune instance SiteSettings trouvée. Création...")
            settings = SiteSettings.get_settings()
            print(f"✅ Instance SiteSettings créée (ID: {settings.id})")
        else:
            settings = SiteSettings.objects.first()
            print(f"✅ Instance SiteSettings trouvée (ID: {settings.id}, Nom: {settings.site_name})")
    except Exception as e:
        print(f"❌ Erreur avec SiteSettings: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Vérifier les utilisateurs
    try:
        user_count = User.objects.count()
        print(f"ℹ️  Nombre d'utilisateurs: {user_count}")
        
        if user_count == 0:
            print("⚠️  Aucun utilisateur trouvé. Créez un superuser avec: python manage.py createsuperuser")
        else:
            superusers = User.objects.filter(is_superuser=True)
            print(f"ℹ️  Nombre de superusers: {superusers.count()}")
    except Exception as e:
        print(f"❌ Erreur avec les utilisateurs: {e}")
        return False
    
    print("\n✅ Vérification terminée!")
    return True

if __name__ == '__main__':
    success = check_database()
    sys.exit(0 if success else 1)

