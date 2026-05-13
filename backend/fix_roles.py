import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from django.contrib.auth.models import User
from api.accounts.models import Account

print("--- FIXING USER ROLES ---")
for user in User.objects.all():
    account, created = Account.objects.get_or_create(user=user)
    if user.is_superuser:
        if account.role != 'admin':
            account.role = 'admin'
            account.save()
            print(f"Fixed: {user.username} role set to admin")
        else:
            print(f"Ok: {user.username} is already admin")
    elif account.role not in ['team', 'admin']:
        account.role = 'team'
        account.save()
        print(f"Fixed: {user.username} role set to team")
    else:
        print(f"Ok: {user.username} has role {account.role}")
