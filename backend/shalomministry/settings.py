# ==========================
# DJANGO SETTINGS
# ==========================

import os
import socket
from pathlib import Path
from urllib.parse import unquote
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# ==========================
# SECURITY SETTINGS
# ==========================

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-change-me-in-production')

# Détection automatique du mode DEBUG pour le développement local
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

# ==========================
# ALLOWED HOSTS
# ==========================

ALLOWED_HOSTS_STR = os.environ.get('ALLOWED_HOSTS', '').strip()

if ALLOWED_HOSTS_STR:
    ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_STR.split(',') if host.strip()]
else:
    ALLOWED_HOSTS = []

# Toujours ajouter localhost en développement (même si DEBUG est False)
# Vérifier si on est en développement local (pas de DATABASE_URL ou SQLite)
is_local_dev = not os.environ.get('DATABASE_URL') or os.environ.get('DATABASE_URL', '').startswith('sqlite')

if not ALLOWED_HOSTS:
    if DEBUG or is_local_dev:
        # En développement, autoriser localhost avec ou sans port
        ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'localhost:8000', 'localhost:8080', '*']
    else:
        # Production: autoriser les domaines spécifiques
        ALLOWED_HOSTS = [
            'shalom-ministry-backend-ipu3.onrender.com',
            'shalom-ministry-backend.onrender.com',
            'shalomministry.wuaze.com',
            'www.shalomministry.wuaze.com',
        ]
elif is_local_dev:
    # Si ALLOWED_HOSTS est défini mais qu'on est en développement local, ajouter localhost
    if 'localhost' not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append('localhost')
    if '127.0.0.1' not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append('127.0.0.1')

# ==========================
# APPLICATION DEFINITION
# ==========================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework_simplejwt',
    'django_filters',
    'corsheaders',

    'api.accounts',
    'api.shops',
    'api.courses',
    'api.sermons',
    'api.settings',
    'api.testimonials',
    'api.announcements',
    'api.contacts',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'api.middlewares.APIDebugMiddleware',
    'api.middlewares.DisableCSRF',
]

ROOT_URLCONF = 'shalomministry.urls'
WSGI_APPLICATION = 'shalomministry.wsgi.application'

# ==========================
# DATABASE CONFIG (Production: PostgreSQL / Local: SQLite)
# ==========================

# Utiliser DATABASE_URL si présent (Render/Production), sinon SQLite (Local)
DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# ==========================
# PASSWORD VALIDATION
# ==========================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ==========================
# INTERNATIONALIZATION
# ==========================

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Bujumbura'
USE_I18N = True
USE_TZ = True

# ==========================
# STATIC FILES & MEDIA
# ==========================

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/api/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ==========================
# DEFAULT PRIMARY KEY
# ==========================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==========================
# REST FRAMEWORK
# ==========================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# ==========================
# CORS & CSRF CONFIGURATION
# ==========================

from corsheaders.defaults import default_headers

# Autoriser les origines en production
if not DEBUG or not is_local_dev:
    CORS_ALLOWED_ORIGINS = [
        "https://shalomministry.wuaze.com",
        "https://www.shalomministry.wuaze.com",
        "https://shalom-ministry-backend-ipu3.onrender.com",
    ]
    CSRF_TRUSTED_ORIGINS = [
        "https://shalomministry.wuaze.com",
        "https://www.shalomministry.wuaze.com",
        "https://shalom-ministry-backend-ipu3.onrender.com",
    ]
    # Important pour Render/Proxies afin que Django sache qu'il est en HTTPS
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
else:
    # En développement, autoriser tout pour faciliter la connexion
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:5173", # Vite default
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ]

# Autoriser les credentials (login, token, session)
CORS_ALLOW_CREDENTIALS = True

# Headers autorisés (important pour le preflight)
CORS_ALLOW_HEADERS = list(default_headers) + [
    "authorization",
    "content-type",
    "x-csrftoken",
]

# ==========================
# TEMPLATES
# ==========================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ==========================
# EMAIL SETTINGS
# ==========================

if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
    EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
    EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() == 'true'
    EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
    DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)
