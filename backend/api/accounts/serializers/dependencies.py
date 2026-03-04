from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.contrib.auth.models import User


from api.accounts.models import *
from api.accounts.serializers import *