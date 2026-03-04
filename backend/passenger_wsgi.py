"""
Passenger WSGI pour cPanel (si nécessaire)
Pour Render, on utilise le Procfile avec gunicorn
"""
import os
import sys

# Absolute path to this file (backend/)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Point Python to the Django project directory (backend/)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.chdir(BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "shalomministry.settings")

from shalomministry.wsgi import application