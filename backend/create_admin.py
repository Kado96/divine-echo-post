import os, sys
import django

# Forcer le répertoire et l'environnement
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
os.environ['USE_LOCAL_SQLITE'] = 'True'

# Setup du moteur SQLite
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = 'donald'
email = 'donald@admin.com'
password = 'admin'

# Création stricte ou mise à jour du mot de passe en outrepassant les validateurs Django pour le script local
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f"✅ Nouveau SuperUtilisateur Créé: {username} | Mdp: {password}")
else:
    u = User.objects.get(username=username)
    u.set_password(password)
    u.save()
    print(f"✅ Mot de passe forcé et mis à jour pour: {username} | Mdp: {password}")
