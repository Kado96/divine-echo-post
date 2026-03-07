from rest_framework import serializers
from django.contrib.auth.models import User
from api.accounts.models import Account

from rest_framework.validators import UniqueValidator

class RegisterSerializer(serializers.Serializer):
	username = serializers.EmailField(validators=[UniqueValidator(queryset=User.objects.all(),message="Cet email est deja pris.")],required=True) 
	phone_number = serializers.CharField(validators=[UniqueValidator(queryset=Account.objects.all(),message="Ce numéro de teéléphone est déjà utilisé.")],required=True)
	password = serializers.CharField(required=True)