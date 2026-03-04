#!/usr/bin/env python
"""
Script de test simple pour l'endpoint /api/settings/current/
"""
import os
import sys
import django

# Configuration du chemin Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')

try:
    django.setup()
except Exception as e:
    print(f"ERREUR lors de l'initialisation de Django: {e}")
    sys.exit(1)

from django.test import RequestFactory
from api.settings.viewsets import SiteSettingsCurrentView
from api.settings.models import SiteSettings
from api.settings.serializers import SiteSettingsSerializer

print("=" * 60)
print("TEST DE L'ENDPOINT /api/settings/current/")
print("=" * 60)

factory = RequestFactory()

# Test 1: Vérifier que le modèle existe
print("\n1. Verification du modele SiteSettings...")
try:
    count = SiteSettings.objects.count()
    print(f"   OK - Nombre d'instances: {count}")
    
    if count == 0:
        print("   ATTENTION - Aucune instance, creation...")
        try:
            settings = SiteSettings.objects.create(
                pk=1,
                site_name='Shalom Ministry',
                description='Plateforme de formation chretienne en ligne',
            )
            print(f"   OK - Instance creee (ID: {settings.id})")
        except Exception as e:
            print(f"   ERREUR lors de la creation: {e}")
            import traceback
            traceback.print_exc()
    else:
        settings = SiteSettings.objects.first()
        print(f"   OK - Instance trouvee (ID: {settings.id})")
except Exception as e:
    print(f"   ERREUR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 2: Tester le serializer
print("\n2. Test du serializer SiteSettingsSerializer...")
try:
    settings = SiteSettings.objects.get(pk=1)
    serializer = SiteSettingsSerializer(settings, context={'request': None})
    data = serializer.data
    print(f"   OK - Serialization reussie")
    print(f"   - Nombre de champs: {len(data)}")
    print(f"   - site_name: {data.get('site_name', 'N/A')}")
except Exception as e:
    print(f"   ERREUR lors de la serialisation: {e}")
    import traceback
    traceback.print_exc()

# Test 3: Tester la vue avec une requête
print("\n3. Test de la vue SiteSettingsCurrentView...")
try:
    view = SiteSettingsCurrentView()
    request = factory.get('/api/settings/current/')
    request.META['SERVER_NAME'] = 'localhost'
    request.META['SERVER_PORT'] = '8000'
    
    response = view.get(request)
    print(f"   OK - Response status: {response.status_code}")
    
    if response.status_code == 200:
        print(f"   OK - Donnees retournees: {len(response.data)} champs")
    else:
        print(f"   ERREUR - Response data: {response.data}")
        
except Exception as e:
    print(f"   ERREUR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("TESTS TERMINES")
print("=" * 60)

