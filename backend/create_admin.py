import os, sys
import django

# Forcer le répertoire et l'environnement
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')

# Setup du moteur
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if username and password:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username, email, password)
        print(f"✅ Nouveau SuperUtilisateur Créé automatique depuis env: {username}")
    else:
        u = User.objects.get(username=username)
        u.set_password(password)
        u.save()
        print(f"✅ Mot de passe mis à jour depuis env pour: {username}")
else:
    print("⚠️ DJANGO_SUPERUSER_PASSWORD ou USERNAME manquants dans l'environnement Render. Création de superuser ignorée.")
