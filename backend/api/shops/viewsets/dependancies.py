from rest_framework import viewsets, status
import re
from rest_framework.response import Response
from  api.shops.models import *
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import transaction
from rest_framework.decorators import action
from django_filters import rest_framework as filters
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime

from api.shops.serializers import *