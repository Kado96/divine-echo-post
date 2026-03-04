"""
Script pour diagnostiquer l'erreur 400
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from django.test import Client
from django.core.handlers.wsgi import WSGIRequest
from django.test import RequestFactory
import json

def test_request():
    """Tester une requête simple"""
    print("=" * 60)
    print("Test de requête GET sur /api/settings/current/")
    print("=" * 60)
    
    client = Client()
    
    try:
        # Faire une requête GET
        response = client.get('/api/settings/current/')
        
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.get('Content-Type', 'N/A')}")
        print(f"Response Headers: {dict(response.items())}")
        
        content = response.content.decode('utf-8', errors='ignore')
        print(f"\nContenu de la réponse ({len(content)} bytes):")
        print("-" * 60)
        print(content[:500])
        print("-" * 60)
        
        if response.status_code == 400:
            print("\nERREUR 400 DETECTEE")
            print(f"Content-Type: {response.get('Content-Type')}")
            if 'text/html' in response.get('Content-Type', ''):
                print("ATTENTION: La reponse est en HTML, pas en JSON!")
                print("Cela signifie que l'erreur vient de Django, pas de DRF")
            try:
                error_data = json.loads(content)
                print("Details de l'erreur:")
                print(json.dumps(error_data, indent=2, ensure_ascii=False))
            except:
                print("Impossible de parser l'erreur en JSON")
                print("Contenu brut:", content[:200])
        elif response.status_code == 200:
            print("\n✅ SUCCÈS - Requête réussie")
            try:
                data = json.loads(content)
                print("Données JSON reçues:")
                print(json.dumps(data, indent=2, ensure_ascii=False)[:300])
            except:
                print("Réponse n'est pas du JSON valide")
        
    except Exception as e:
        print(f"Exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_request()

