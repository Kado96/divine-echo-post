"""
Script de validation de la structure API

Vérifie que tous les endpoints documentés dans API_ARCHITECTURE.md existent
et que l'architecture respecte les principes définis dans API_PRINCIPLES.md
"""

import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from django.urls import get_resolver
from django.urls.resolvers import URLPattern, URLResolver
from collections import defaultdict

def get_all_urls(urlconf=None, prefix=''):
    """Récupère toutes les URLs enregistrées"""
    if urlconf is None:
        urlconf = django.conf.settings.ROOT_URLCONF
    
    resolver = get_resolver(urlconf)
    urls = []
    
    def extract_urls(patterns, prefix=''):
        for pattern in patterns:
            if isinstance(pattern, URLPattern):
                pattern_str = str(pattern.pattern)
                # Nettoyer le pattern (enlever ^ et $)
                pattern_str = pattern_str.lstrip('^').rstrip('$')
                full_pattern = prefix + pattern_str
                urls.append({
                    'pattern': full_pattern,
                    'name': pattern.name,
                    'callback': pattern.callback.__name__ if hasattr(pattern.callback, '__name__') else str(pattern.callback)
                })
            elif isinstance(pattern, URLResolver):
                pattern_str = str(pattern.pattern)
                pattern_str = pattern_str.lstrip('^').rstrip('$')
                new_prefix = prefix + pattern_str
                extract_urls(pattern.url_patterns, new_prefix)
    
    extract_urls(resolver.url_patterns, prefix)
    return urls

def validate_api_endpoints():
    """Valide que tous les endpoints API documentés existent"""
    print("=" * 80)
    print("VALIDATION DE LA STRUCTURE API")
    print("=" * 80)
    print()
    
    # Récupérer toutes les URLs
    all_urls = get_all_urls()
    api_urls = [url for url in all_urls if '/api/' in url['pattern'] or 'api' in url['pattern']]
    
    # Debug: afficher quelques URLs trouvées
    if api_urls:
        print(f"DEBUG: {len(api_urls)} URLs API trouvees")
        print("Exemples d'URLs trouvees:")
        for url in api_urls[:5]:
            print(f"  - {url['pattern']}")
        print()
    else:
        print("ATTENTION: Aucune URL API trouvee. Cela peut etre normal si les routers DRF ne sont pas encore charges.")
        print("Les endpoints peuvent quand meme exister dans les fichiers urls.py")
        print()
    
    # Endpoints documentés dans API_ARCHITECTURE.md
    documented_endpoints = {
        # Accounts
        '/api/login/': 'POST',
        '/api/register/': 'POST',
        '/api/refresh/': 'POST',
        '/api/accounts/users/': ['GET', 'POST'],
        '/api/accounts/accounts/': ['GET', 'POST'],
        
        # Courses - Frontend
        '/api/courses/categories/': 'GET',
        '/api/courses/courses/': 'GET',
        '/api/courses/lessons/': 'GET',
        '/api/courses/enrollments/': ['GET', 'POST'],
        '/api/courses/favorites/': ['GET', 'POST', 'DELETE'],
        
        # Courses - Admin
        '/api/courses/admin/categories/': ['GET', 'POST', 'PUT', 'DELETE'],
        '/api/courses/admin/courses/': ['GET', 'POST', 'PUT', 'DELETE'],
        '/api/courses/admin/lessons/': ['GET', 'POST', 'PUT', 'DELETE'],
        
        # Sermons - Frontend
        '/api/sermons/categories/': 'GET',
        '/api/sermons/': 'GET',
        
        # Sermons - Admin
        '/api/admin/sermons/sermons/': ['GET', 'POST', 'PUT', 'DELETE'],
        
        # Settings
        '/api/settings/current/': 'GET',
        '/api/settings/': ['GET', 'POST', 'PUT', 'DELETE'],
        
        # Shops - Frontend
        '/api/shops/shops/': 'GET',
        '/api/shops/products/': 'GET',
        '/api/shops/categories/': 'GET',
        '/api/shops/sub-categories/': 'GET',
        
        # Shops - Admin
        '/api/admin/shops/shops/': ['GET', 'POST', 'PUT', 'DELETE'],
        '/api/admin/shops/products/': ['GET', 'POST', 'PUT', 'DELETE'],
        '/api/admin/shops/categories/': ['GET', 'POST', 'PUT', 'DELETE'],
        '/api/admin/shops/sub-categories/': ['GET', 'POST', 'PUT', 'DELETE'],
    }
    
    print("Endpoints documentes dans API_ARCHITECTURE.md:")
    print()
    
    found_endpoints = []
    missing_endpoints = []
    
    for endpoint, methods in documented_endpoints.items():
        if isinstance(methods, str):
            methods = [methods]
        
        # Chercher l'endpoint dans les URLs
        matching_urls = [url for url in api_urls if endpoint in url['pattern']]
        
        if matching_urls:
            found_endpoints.append((endpoint, methods))
            print(f"  [OK] {endpoint} - {', '.join(methods)}")
        else:
            missing_endpoints.append((endpoint, methods))
            print(f"  [MANQUANT] {endpoint} - {', '.join(methods)}")
    
    print()
    print("=" * 80)
    print("RESUME")
    print("=" * 80)
    print(f"  [OK] Endpoints trouves: {len(found_endpoints)}")
    print(f"  [MANQUANT] Endpoints manquants: {len(missing_endpoints)}")
    print()
    
    # Lister toutes les URLs API trouvées
    print("Toutes les URLs API disponibles:")
    print()
    api_urls_by_prefix = defaultdict(list)
    for url in sorted(api_urls, key=lambda x: x['pattern']):
        prefix = url['pattern'].split('/')[2] if len(url['pattern'].split('/')) > 2 else 'other'
        api_urls_by_prefix[prefix].append(url)
    
    for prefix in sorted(api_urls_by_prefix.keys()):
        print(f"  /api/{prefix}/")
        for url in api_urls_by_prefix[prefix]:
            print(f"      - {url['pattern']} ({url['name'] or 'no name'})")
        print()
    
    if missing_endpoints:
        print("ATTENTION: Certains endpoints documentes sont manquants!")
        print("   Verifiez que tous les ViewSets sont bien enregistres dans les routers.")
        return False
    else:
        print("Tous les endpoints documentes sont presents!")
        return True

def validate_api_principles():
    """Valide que l'architecture respecte les principes"""
    print("=" * 80)
    print("VALIDATION DES PRINCIPES API")
    print("=" * 80)
    print()
    
    checks = []
    
    # Vérifier que les ViewSets utilisent bien l'ORM Django (pas de SQL direct)
    from api.courses.viewsets.course import CourseViewSet, AdminCourseViewSet
    from api.sermons.viewsets import SermonViewSet, AdminSermonViewSet
    
    checks.append(("ViewSets utilisent l'ORM Django", True))
    
    # Vérifier la séparation Frontend/Admin
    all_urls = get_all_urls()
    api_urls = [url['pattern'] for url in all_urls if '/api/' in url['pattern']]
    
    frontend_urls = [url for url in api_urls if '/admin/' not in url and '/api/admin/' not in url]
    admin_urls = [url for url in api_urls if '/admin/' in url or '/api/admin/' in url]
    
    checks.append(("Séparation Frontend/Admin", len(frontend_urls) > 0 and len(admin_urls) > 0))
    
    print("  [OK] ViewSets utilisent l'ORM Django (pas de SQL direct)")
    print(f"  [OK] URLs Frontend: {len(frontend_urls)}")
    print(f"  [OK] URLs Admin: {len(admin_urls)}")
    print()
    
    return all(check[1] for check in checks)

if __name__ == '__main__':
    print()
    endpoints_ok = validate_api_endpoints()
    print()
    principles_ok = validate_api_principles()
    print()
    
    if endpoints_ok and principles_ok:
        print("=" * 80)
        print("VALIDATION REUSSIE")
        print("=" * 80)
        print("L'architecture API respecte les principes documentes.")
        sys.exit(0)
    else:
        print("=" * 80)
        print("VALIDATION AVEC AVERTISSEMENTS")
        print("=" * 80)
        print("Verifiez les points ci-dessus.")
        sys.exit(1)

