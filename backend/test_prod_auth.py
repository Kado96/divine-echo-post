import os, sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ['DJANGO_SETTINGS_MODULE'] = 'shalomministry.settings'
os.environ['USE_LOCAL_SQLITE'] = 'False'

import django
django.setup()

from django.contrib.auth import authenticate

# Test avec le mot de passe env Render
user = authenticate(username='donald', password='admin')
if user:
    print("AUTH OK: donald/admin fonctionne")
else:
    print("AUTH FAILED: donald/admin ne fonctionne PAS")
    # Verifions si le hash est correct
    from django.contrib.auth import get_user_model
    User = get_user_model()
    u = User.objects.get(username='donald')
    print(f"  Hash actuel: {u.password[:50]}...")
    print(f"  check_password('admin'): {u.check_password('admin')}")
    # Reset le password
    u.set_password('admin')
    u.save()
    print("  Password reset to 'admin' - retrying...")
    user2 = authenticate(username='donald', password='admin')
    print(f"  Retry auth: {'OK' if user2 else 'STILL FAILED'}")
