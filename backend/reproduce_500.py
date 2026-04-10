import os, sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ['DJANGO_SETTINGS_MODULE'] = 'shalomministry.settings'
os.environ['USE_LOCAL_SQLITE'] = 'False'

import django
django.setup()

from django.contrib.auth.models import User
from api.accounts.serializers.AdminUserSerializer import AdminUserSerializer
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
request = factory.post('/api/accounts/users/', {
    'username': 'testuser_' + str(os.urandom(4).hex()),
    'email': 'test' + str(os.urandom(4).hex()) + '@example.com',
    'password': 'password123',
    'is_staff': 'true',
    'is_superuser': 'false'
})

# Mock user for permissions
admin = User.objects.filter(is_superuser=True).first()
if not admin:
    print("No admin user found to perform test")
    sys.exit(1)

print(f"Testing with admin user: {admin.username}")

serializer = AdminUserSerializer(data={
    'username': 'newuser_' + str(os.urandom(4).hex()),
    'email': 'new' + str(os.urandom(4).hex()) + '@example.com',
    'password': 'password123',
    'is_staff': True,
    'is_superuser': False
})

try:
    if serializer.is_valid():
        print("Serializer is valid")
        user = serializer.save()
        print(f"SUCCESS: User created with ID {user.id}")
    else:
        print(f"Validation Errors: {serializer.errors}")
except Exception as e:
    print(f"CRASH: {type(e).__name__} - {str(e)}")
    import traceback
    traceback.print_exc()
