from rest_framework import serializers
from django.contrib.auth.models import User

	
class UserSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True)
	
	class Meta:
		model = User
		exclude = "last_login", "is_superuser", "groups", "is_staff", "is_active", "date_joined", "user_permissions"
		depth = 1
		extra_kwargs = {
			'username': {'validators': []},
		}