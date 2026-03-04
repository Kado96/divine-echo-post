"""
WSGI config for shalomministry project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os
import sys

# CRITIQUE : Configurer le PYTHONPATH AVANT d'importer Django
# Sur Render, le chemin est /opt/render/project/src/backend/
# Il faut que backend/ soit dans sys.path pour que 'api.*' soit importable

# Obtenir le répertoire backend (parent de shalomministry/)
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Ajouter backend/ au PYTHONPATH (priorité absolue)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Sur Render, vérifier aussi le répertoire parent
parent_dir = os.path.dirname(backend_dir)
if parent_dir not in sys.path:
    # Vérifier si le parent contient backend/api (structure Render)
    backend_in_parent = os.path.join(parent_dir, 'backend')
    if os.path.exists(os.path.join(backend_in_parent, 'api')):
        if backend_in_parent not in sys.path:
            sys.path.insert(0, backend_in_parent)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')

application = get_wsgi_application()
