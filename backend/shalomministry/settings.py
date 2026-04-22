# pyre-ignore-all-errors
# ==========================
# DJANGO SETTINGS
# ==========================

import os
from pathlib import Path
import dj_database_url  # pyre-ignore

BASE_DIR = Path(__file__).resolve().parent.parent

# ==========================
# LOAD ENV
# ==========================

def load_env():
    dotenv_path = os.path.join(BASE_DIR, '.env')
    if os.path.exists(dotenv_path):
        with open(dotenv_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    value = value.strip('"').strip("'")
                    os.environ.setdefault(key.strip(), value.strip())

load_env()

# ==========================
# SECURITY
# ==========================

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-change-me"
)

DEBUG = os.environ.get("DEBUG", "True").lower() == "true"

# ==========================
# ALLOWED HOSTS
# ==========================

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "shalom-ministry-backend-ipu3.onrender.com",
    "shalomministry.wuaze.com",
    "www.shalomministry.wuaze.com",
    "*"
]

# ==========================
# APPLICATIONS
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
    # 'api.shops',      <-- Supprimé pour plateforme d'émissions
    # 'api.courses',    <-- Supprimé pour plateforme d'émissions
    'api.sermons',
    'api.settings',
    'api.testimonials',
    'api.announcements',
    'api.contacts',
    'api.media',
    'drf_yasg',
]

# ==========================
# MIDDLEWARE
# ==========================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'api.middlewares.APIDebugMiddleware',
    'api.middlewares.DisableCSRF',
    'api.middlewares.MediaCORSMiddleware',
]

ROOT_URLCONF = 'shalomministry.urls'
WSGI_APPLICATION = 'shalomministry.wsgi.application'

# ==========================
# DATABASE
# ==========================

DATABASE_URL = os.environ.get("DATABASE_URL")
USE_LOCAL_SQLITE = os.environ.get("USE_LOCAL_SQLITE", "False").lower() == "true"

if DATABASE_URL and not USE_LOCAL_SQLITE:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=0,
            ssl_require=True
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
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

LOCALE_PATHS = [
    BASE_DIR / 'locale',
]

# ==========================
# STATIC FILES & MEDIA
# ==========================

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

if USE_LOCAL_SQLITE:
    MEDIA_URL = '/api/media/'
    MEDIA_ROOT = BASE_DIR / 'media'
else:
    PROJECT_ID = os.environ.get("SUPABASE_PROJECT_ID", "eiokoxdmgxxyexmqfsua")
    AWS_STORAGE_BUCKET_NAME = os.environ.get("AWS_STORAGE_BUCKET_NAME", "media")
    
    if PROJECT_ID:
        # Configuration Supabase Storage standard et robuste selon astuce.md
        # Note: on utilise storage.supabase.co pour l'URL publique des objets
        AWS_S3_CUSTOM_DOMAIN = f"{PROJECT_ID}.supabase.co/storage/v1/object/public/{AWS_STORAGE_BUCKET_NAME}"
        MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/"
        DEFAULT_FILE_STORAGE = 'api.utils.storage.CleanS3Boto3Storage'
        
        # Configuration boto3 nécessaire (les clés doivent être dans .env.production)
        AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
        AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
        AWS_S3_ENDPOINT_URL = f"https://{PROJECT_ID}.supabase.co/storage/v1/s3"
        AWS_S3_REGION_NAME = os.environ.get("AWS_S3_REGION_NAME", "eu-central-1")
        AWS_S3_SIGNATURE_VERSION = "s3v4"
    else:
        # Fallback de sécurité si les variables n'existent pas
        MEDIA_URL = '/api/media/'
        MEDIA_ROOT = BASE_DIR / 'media'

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

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'AUTH_HEADER_TYPES': ('Bearer', 'JWT'),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
}

# ==========================
# CORS CONFIGURATION
# ==========================

from corsheaders.defaults import default_headers  # pyre-ignore

# CORS & CSRF
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOW_CREDENTIALS = True

# Autoriser les origines en production
if not DEBUG:
    CORS_ALLOWED_ORIGINS = [
        "https://shalomministry.wuaze.com",
        "http://shalomministry.wuaze.com",
        "https://www.shalomministry.wuaze.com",
        "http://www.shalomministry.wuaze.com",
        "https://shalom-ministry-backend-ipu3.onrender.com",
        "https://shalom-ministry-backend.onrender.com",
        "https://shalom-ministry.onrender.com",
        "https://shalom-ministry-frontend.onrender.com",
    ]
    # Domaines de confiance pour les requêtes CSRF (formulaires, API PATCH/POST)
    CSRF_TRUSTED_ORIGINS = [
        "https://shalomministry.wuaze.com",
        "http://shalomministry.wuaze.com",
        "https://www.shalomministry.wuaze.com",
        "http://www.shalomministry.wuaze.com",
        "https://shalom-ministry-backend-ipu3.onrender.com",
        "https://shalom-ministry-backend.onrender.com",
    ]
else:
    # En développement, autoriser tout pour faciliter la connexion
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:5173", # Vite
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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
