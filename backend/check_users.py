import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from django.contrib.auth.models import User
from api.accounts.models import Account

print("--- USER ROLES AUDIT ---")
for user in User.objects.all():
    role = "N/A"
    if hasattr(user, 'account'):
        role = user.account.role
    print(f"Username: {user.username:20} | Superuser: {str(user.is_superuser):6} | Role: {role}")
