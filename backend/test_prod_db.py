import os, sys
import django
import dj_database_url
from django.conf import settings

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
os.environ['USE_LOCAL_SQLITE'] = 'False'

# On va charger la configuration de prod manuellement comme dans le script de synchro
with open('.env', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'): continue
        if '=' in line:
            key, value = line.split('=', 1)
            if key == 'DATABASE_URL':
                os.environ['DATABASE_URL'] = value.strip('"').strip("'")

django.setup()

from django.contrib.auth import authenticate
user = authenticate(username='donald', password='admin')
if user is not None:
    print("✅ Connexion directe à la DB Supabase avec donald/admin: REUSSIE!")
else:
    print("❌ Connexion directe à la DB Supabase avec donald/admin: ECHEC!")
    from django.contrib.auth import get_user_model
    User = get_user_model()
    u = User.objects.filter(username='donald').first()
    if u:
        print(f"L'utilisateur existe. is_active={u.is_active}. Password_hash_starts_with={u.password[:15]}")
    else:
        print("L'utilisateur n'existe même pas dans cette base!")
