#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# CRITIQUE : Configurer le PYTHONPATH AVANT d'importer Django
# Sur Render, le chemin est /opt/render/project/src/backend/
# Il faut que backend/ soit dans sys.path pour que 'api.*' soit importable

# Obtenir le répertoire où se trouve manage.py (backend/)
backend_dir = os.path.dirname(os.path.abspath(__file__))

# Ajouter backend/ au PYTHONPATH (priorité absolue)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Sur Render, le répertoire de travail peut être /opt/render/project/src/
# Vérifier si on est dans un sous-répertoire et ajouter le parent si nécessaire
parent_dir = os.path.dirname(backend_dir)
if parent_dir not in sys.path:
    # Vérifier si le parent contient backend/api (structure Render)
    if os.path.exists(os.path.join(parent_dir, 'backend', 'api')):
        # Cas Render : /opt/render/project/src/backend/api
        # Ajouter /opt/render/project/src/backend au chemin
        backend_in_parent = os.path.join(parent_dir, 'backend')
        if backend_in_parent not in sys.path:
            sys.path.insert(0, backend_in_parent)
    # Aussi ajouter le parent directement au cas où
    if os.path.exists(os.path.join(parent_dir, 'api')):
        sys.path.insert(0, parent_dir)

# Debug : Afficher le PYTHONPATH pour diagnostic
if os.getenv('DEBUG', '').lower() == 'true' or 'render' in os.getcwd().lower():
    print(f"DEBUG: PYTHONPATH configuré:")
    print(f"   - backend_dir: {backend_dir}")
    print(f"   - sys.path (premiers 3): {sys.path[:3]}")
    # Tester l'import
    try:
        import api.settings
        print(f"   OK: api.settings importable")
    except ImportError as e:
        print(f"   ERROR: api.settings non importable: {e}")

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
