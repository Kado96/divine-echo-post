import os
import django
import dj_database_url
from django.conf import settings

def load_env():
    # Chercher .env dans le dossier courant
    dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(dotenv_path):
        with open(dotenv_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'): continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    value = value.strip('"').strip("'")
                    os.environ.setdefault(key.strip(), value.strip())

def reset_prod_password():
    load_env()
    prod_url = os.environ.get('DATABASE_URL')
    if not prod_url:
        print("❌ DATABASE_URL manquante dans l'environnement")
        return

    # Configuration minimale pour que Django fonctionne vers la prod
    if not settings.configured:
        settings.configure(
            DATABASES={'default': dj_database_url.parse(prod_url, ssl_require=True)},
            INSTALLED_APPS=[
                'django.contrib.auth',
                'django.contrib.contenttypes',
            ],
            AUTH_PASSWORD_VALIDATORS=[],
            TIME_ZONE='Africa/Bujumbura',
            USE_TZ=True,
            SECRET_KEY='temporary-key-for-reset',
        )
    
    django.setup()
    
    from django.contrib.auth.models import User
    
    try:
        u = User.objects.get(username='donald')
        u.set_password('admin')
        u.save()
        print(f"✅ SUCCÈS: Mot de passe de '{u.username}' réinitialisé sur la PROD (Supabase).")
    except User.DoesNotExist:
        print("❌ ERREUR: Utilisateur 'donald' introuvable en production.")
    except Exception as e:
        print(f"❌ ERREUR CRITIQUE: {e}")

if __name__ == "__main__":
    reset_prod_password()
