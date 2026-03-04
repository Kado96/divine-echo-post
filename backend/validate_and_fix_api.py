"""
Script de validation et correction de la structure API

Vérifie directement les fichiers urls.py et ajoute automatiquement
les routes manquantes selon la documentation API_ARCHITECTURE.md
"""

import os
import sys
import re
import ast
from pathlib import Path
from typing import Dict, List, Tuple, Set

# Configuration des endpoints documentés
DOCUMENTED_ENDPOINTS = {
    # Authentification (dans shalomministry/urls.py)
    'auth': {
        '/api/login/': {'method': 'POST', 'type': 'path', 'view': 'CustomTokenObtainPairView'},
        '/api/register/': {'method': 'POST', 'type': 'path', 'view': 'RegisterViewSet'},
        '/api/refresh/': {'method': 'POST', 'type': 'path', 'view': 'TokenRefreshView'},
    },
    # Accounts
    'accounts': {
        '/api/accounts/users/': {'method': ['GET', 'POST'], 'type': 'router', 'viewset': 'UserViewSet', 'basename': 'users'},
        '/api/accounts/accounts/': {'method': ['GET', 'POST'], 'type': 'router', 'viewset': 'AccountViewSet', 'basename': 'accounts'},
    },
    # Courses - Frontend
    'courses': {
        '/api/courses/categories/': {'method': 'GET', 'type': 'router', 'viewset': 'CourseCategoryViewSet', 'basename': 'categories'},
        '/api/courses/courses/': {'method': 'GET', 'type': 'router', 'viewset': 'CourseViewSet', 'basename': 'courses'},
        '/api/courses/lessons/': {'method': 'GET', 'type': 'router', 'viewset': 'LessonViewSet', 'basename': 'lessons'},
        '/api/courses/enrollments/': {'method': ['GET', 'POST'], 'type': 'router', 'viewset': 'EnrollmentViewSet', 'basename': 'enrollments'},
        '/api/courses/favorites/': {'method': ['GET', 'POST', 'DELETE'], 'type': 'router', 'viewset': 'FavoriteViewSet', 'basename': 'favorites'},
    },
    # Courses - Admin
    'courses_admin': {
        '/api/courses/admin/categories/': {'method': ['GET', 'POST', 'PUT', 'DELETE'], 'type': 'router', 'viewset': 'AdminCourseCategoryViewSet', 'basename': 'admin-categories'},
        '/api/courses/admin/courses/': {'method': ['GET', 'POST', 'PUT', 'DELETE'], 'type': 'router', 'viewset': 'AdminCourseViewSet', 'basename': 'admin-courses'},
        '/api/courses/admin/lessons/': {'method': ['GET', 'POST', 'PUT', 'DELETE'], 'type': 'router', 'viewset': 'AdminLessonViewSet', 'basename': 'admin-lessons'},
    },
    # Sermons - Frontend
    'sermons': {
        '/api/sermons/categories/': {'method': 'GET', 'type': 'router', 'viewset': 'SermonCategoryViewSet', 'basename': 'sermon-category'},
        '/api/sermons/': {'method': 'GET', 'type': 'router', 'viewset': 'SermonViewSet', 'basename': 'sermon'},
    },
    # Sermons - Admin
    'sermons_admin': {
        '/api/admin/sermons/sermons/': {'method': ['GET', 'POST', 'PUT', 'DELETE'], 'type': 'router', 'viewset': 'AdminSermonViewSet', 'basename': 'admin-sermon'},
    },
    # Settings
    'settings': {
        '/api/settings/current/': {'method': 'GET', 'type': 'path', 'view': 'SiteSettingsCurrentView'},
        '/api/settings/': {'method': ['GET', 'POST', 'PUT', 'DELETE'], 'type': 'router', 'viewset': 'SiteSettingsViewSet', 'basename': 'settings'},
    },
    # Shops - Frontend
    'shops': {
        '/api/shops/shops/': {'method': 'GET', 'type': 'router', 'viewset': 'ShopViewSet', 'basename': 'shops'},
        '/api/shops/products/': {'method': 'GET', 'type': 'router', 'viewset': 'ProductViewSet', 'basename': 'products'},
        '/api/shops/categories/': {'method': 'GET', 'type': 'router', 'viewset': 'CategoryViewSet', 'basename': 'categories'},
        '/api/shops/sub-categories/': {'method': 'GET', 'type': 'router', 'viewset': 'SubCategoryViewSet', 'basename': 'sub-categories'},
    },
    # Shops - Admin
    'shops_admin': {
        '/api/admin/shops/shops/': {'method': ['GET', 'POST', 'PUT', 'DELETE'], 'type': 'router', 'viewset': 'AdminProductViewSet', 'basename': 'admin-shops'},
        '/api/admin/shops/products/': {'method': ['GET', 'POST', 'PUT', 'DELETE'], 'type': 'router', 'viewset': 'AdminProductViewSet', 'basename': 'admin-products'},
        '/api/admin/shops/categories/': {'method': ['GET', 'POST', 'PUT', 'DELETE'], 'type': 'router', 'viewset': 'AdminShopCategoryViewSet', 'basename': 'admin-shop-categories'},
        '/api/admin/shops/sub-categories/': {'method': ['GET', 'POST', 'PUT', 'DELETE'], 'type': 'router', 'viewset': 'AdminShopSubCategoryViewSet', 'basename': 'admin-shop-sub-categories'},
    },
}

# Mapping des fichiers urls.py
URLS_FILES = {
    'auth': 'shalomministry/urls.py',
    'accounts': 'api/accounts/urls.py',
    'courses': 'api/courses/urls.py',
    'sermons': 'api/sermons/urls.py',
    'settings': 'api/settings/urls.py',
    'shops': 'api/shops/urls.py',
}

def read_file_content(filepath: str) -> str:
    """Lit le contenu d'un fichier"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return None

def find_router_registrations(content: str) -> Set[str]:
    """Trouve toutes les enregistrements de router"""
    registrations = set()
    
    # Pattern pour router.register("name", ViewSet, basename="...")
    pattern1 = r'router\.register\([^,]+,\s*(\w+ViewSet)'
    matches = re.findall(pattern1, content)
    registrations.update(matches)
    
    # Pattern pour admin_router.register
    pattern2 = r'admin_router\.register\([^,]+,\s*(\w+ViewSet)'
    matches = re.findall(pattern2, content)
    registrations.update(matches)
    
    return registrations

def find_path_registrations(content: str) -> Set[str]:
    """Trouve toutes les enregistrements de path"""
    paths = set()
    
    # Pattern pour path('api/...', View.as_view())
    pattern = r"path\(['\"]([^'\"]+)['\"],\s*(\w+)\.as_view\(\)"
    matches = re.findall(pattern, content)
    for path_str, view in matches:
        if 'api/' in path_str:
            paths.add(f"/{path_str}")
    
    return paths

def check_endpoint_exists(endpoint: str, content: str, endpoint_config: dict, filepath: str = '') -> bool:
    """Vérifie si un endpoint existe dans le fichier"""
    if endpoint_config['type'] == 'router':
        viewset = endpoint_config.get('viewset')
        if viewset:
            # Extraire le nom de la route depuis l'endpoint
            # Ex: /api/courses/categories/ -> categories
            parts = endpoint.strip('/').split('/')
            route_name = parts[-1] if parts else ''
            
            # Vérifier si le ViewSet est importé
            if viewset not in content:
                return False
            
            # Vérifier si le router est enregistré avec ce ViewSet
            # Pattern: router.register(r"categories", CourseCategoryViewSet, ...)
            # ou router.register("categories", CourseCategoryViewSet, ...)
            patterns = [
                rf'router\.register\([^,]*["\']([^"\']+)["\'][^,]*,\s*{viewset}',
                rf'router\.register\(r["\']([^"\']+)["\'][^,]*,\s*{viewset}',
                rf'admin_router\.register\([^,]*["\']([^"\']+)["\'][^,]*,\s*{viewset}',
                rf'admin_router\.register\(r["\']([^"\']+)["\'][^,]*,\s*{viewset}',
            ]
            
            for pattern in patterns:
                if re.search(pattern, content):
                    return True
            
            # Vérifier aussi avec le nom de route (plus flexible)
            if route_name:
                # Chercher toutes les occurrences de router.register avec le nom de route
                pattern_route = rf'(router|admin_router)\.register\([^,]*["\']([^"\']*{re.escape(route_name)}[^"\']*)["\']'
                matches = re.finditer(pattern_route, content)
                for match in matches:
                    # Vérifier que le ViewSet est dans les 300 caractères suivants
                    start_pos = match.end()
                    context = content[start_pos:start_pos+300]
                    if viewset in context:
                        return True
            
            # Pour les routers avec route vide (r''), vérifier si c'est le seul ViewSet enregistré
            # Ex: router.register(r'', SiteSettingsViewSet, ...) pour /api/settings/
            if route_name == 'settings' or (not route_name and 'settings' in endpoint.lower()):
                # Chercher router.register avec route vide et ce ViewSet
                pattern_empty = rf'(router|admin_router)\.register\([^,]*["\']\s*["\'][^,]*,\s*{viewset}'
                if re.search(pattern_empty, content):
                    return True
    elif endpoint_config['type'] == 'path':
        view = endpoint_config.get('view')
        if view:
            # Extraire le chemin de l'endpoint
            # Pour le fichier principal, garder api/ dans le chemin
            filepath_str = str(filepath) if hasattr(filepath, '__str__') else filepath
            if 'shalomministry' in filepath_str:
                # Pour shalomministry/urls.py, le chemin doit être api/login/
                path_part = endpoint.lstrip('/')  # /api/login/ -> api/login/
            else:
                # Pour les fichiers de modules, enlever /api/module/
                path_part = endpoint.replace('/api/', '').rstrip('/')
                parts = endpoint.strip('/').split('/')
                if len(parts) >= 3:
                    path_part = '/'.join(parts[2:])  # Enlever /api/module/
            
            # Pattern pour path('api/login/', View.as_view())
            # Ignorer le nom dans la recherche (name peut varier)
            # Enlever le slash final pour plus de flexibilité
            path_part_clean = path_part.rstrip('/')
            patterns = [
                rf"path\(['\"][^'\"]*{re.escape(path_part_clean)}['\"]?/?['\"]?[^)]*{view}",
                rf"path\(['\"][^'\"]*{re.escape(path_part_clean)}['\"]?/?['\"]?[^)]*{view}\.as_view\(\)",
                rf"path\(['\"][^'\"]*{re.escape(path_part)}['\"][^)]*{view}",
                rf"path\(['\"][^'\"]*{re.escape(path_part)}['\"][^)]*{view}\.as_view\(\)",
            ]
            
            for pattern in patterns:
                if re.search(pattern, content):
                    return True
            
            # Pour settings/current/, vérifier aussi avec juste 'current'
            if 'current' in path_part_clean and 'settings' in filepath_str:
                # Chercher path('current/', ...) ou path('current', ...)
                if re.search(rf"path\(['\"][^'\"]*current['\"]?/?['\"]?[^)]*{view}", content):
                    return True
            
            # Pour les routes dans le fichier principal qui incluent d'autres modules
            # Ex: path('api/courses/', include("api.courses.urls"))
            if 'include(' in content:
                module_path = path_part.split('/')[0] if '/' in path_part else path_part
                pattern_include = rf"path\(['\"][^'\"]*{re.escape(module_path)}['\"][^)]*include"
                if re.search(pattern_include, content):
                    # Si c'est un include, on considère que c'est présent
                    # (la vérification détaillée se fera dans le fichier du module)
                    return True
    
    return False

def generate_router_code(endpoint: str, endpoint_config: dict) -> str:
    """Génère le code pour ajouter une route router"""
    viewset = endpoint_config.get('viewset')
    basename = endpoint_config.get('basename', '')
    
    # Extraire le nom de la route depuis l'endpoint
    # Ex: /api/courses/categories/ -> categories
    parts = endpoint.strip('/').split('/')
    route_name = parts[-1] if parts else ''
    
    # Déterminer si c'est un admin_router
    if '/admin/' in endpoint:
        router_name = 'admin_router'
    else:
        router_name = 'router'
    
    code = f'    {router_name}.register(r"{route_name}", {viewset}, basename="{basename}")'
    return code

def generate_path_code(endpoint: str, endpoint_config: dict, filepath: str = '') -> str:
    """Génère le code pour ajouter une route path"""
    view = endpoint_config.get('view')
    
    # Pour le fichier principal (shalomministry/urls.py), garder le chemin complet
    if 'shalomministry' in filepath:
        path_part = endpoint.replace('/api/', '').rstrip('/')
    else:
        # Pour les fichiers de modules, enlever le préfixe du module
        # Ex: /api/settings/current/ -> current/
        parts = endpoint.strip('/').split('/')
        if len(parts) >= 3:
            path_part = '/'.join(parts[2:])  # Enlever /api/module/
        else:
            path_part = endpoint.replace('/api/', '').rstrip('/')
    
    name = path_part.replace('/', '-').rstrip('-')
    code = f"    path('{path_part}/', {view}.as_view(), name='{name}'),"
    return code

def add_missing_imports(filepath: str, content: str, missing_viewsets: List[str], missing_views: List[str]) -> str:
    """Ajoute les imports manquants"""
    lines = content.split('\n')
    
    # Trouver la ligne des imports
    import_line_idx = -1
    for i, line in enumerate(lines):
        if 'from' in line and ('viewsets' in line or 'views' in line):
            import_line_idx = i
            break
    
    if import_line_idx == -1:
        # Ajouter après les imports existants
        for i, line in enumerate(lines):
            if line.startswith('from django.urls'):
                import_line_idx = i + 1
                break
    
    # Ajouter les imports manquants
    new_imports = []
    if missing_viewsets:
        # Déterminer le module d'import
        if 'courses' in filepath:
            module = 'api.courses.viewsets'
        elif 'sermons' in filepath:
            module = 'api.sermons.viewsets'
        elif 'accounts' in filepath:
            module = 'api.accounts.viewsets'
        elif 'settings' in filepath:
            module = 'api.settings.viewsets'
        elif 'shops' in filepath:
            module = 'api.shops.viewsets'
        else:
            module = 'api.viewsets'
        
        imports_str = ', '.join(missing_viewsets)
        new_imports.append(f'from {module} import {imports_str}')
    
    if missing_views:
        # Pour les views, c'est généralement dans le même module
        if 'settings' in filepath:
            module = 'api.settings.viewsets'
        elif 'accounts' in filepath:
            module = 'api.accounts.viewsets'
        else:
            module = 'api.viewsets'
        
        imports_str = ', '.join(missing_views)
        new_imports.append(f'from {module} import {imports_str}')
    
    # Insérer les nouveaux imports
    for new_import in reversed(new_imports):
        lines.insert(import_line_idx + 1, new_import)
    
    return '\n'.join(lines)

def fix_urls_file(filepath: str, missing_endpoints: Dict[str, dict]) -> bool:
    """Corrige un fichier urls.py en ajoutant les routes manquantes"""
    content = read_file_content(filepath)
    if content is None:
        print(f"  ERREUR: Fichier {filepath} non trouve")
        return False
    
    original_content = content
    lines = content.split('\n')
    
    # Trouver où insérer les nouvelles routes
    router_insert_idx = -1
    path_insert_idx = -1
    
    for i, line in enumerate(lines):
        if 'router.register(' in line or 'admin_router.register(' in line:
            router_insert_idx = i
        if "path('" in line or 'path("' in line:
            if path_insert_idx == -1:
                path_insert_idx = i
    
    # Générer le code pour les routes manquantes
    router_code = []
    path_code = []
    missing_viewsets = []
    missing_views = []
    
    for endpoint, config in missing_endpoints.items():
        if config['type'] == 'router':
            code = generate_router_code(endpoint, config)
            router_code.append(code)
            viewset = config.get('viewset')
            if viewset and viewset not in content:
                missing_viewsets.append(viewset)
        elif config['type'] == 'path':
            code = generate_path_code(endpoint, config, filepath)
            path_code.append(code)
            view = config.get('view')
            if view and view not in content:
                missing_views.append(view)
    
    # Ajouter les imports manquants
    if missing_viewsets or missing_views:
        content = add_missing_imports(filepath, content, missing_viewsets, missing_views)
        lines = content.split('\n')
    
    # Insérer les routes router
    if router_code:
        if router_insert_idx != -1:
            # Insérer après la dernière route router
            for code in reversed(router_code):
                lines.insert(router_insert_idx + 1, code)
        else:
            # Trouver où est défini le router
            for i, line in enumerate(lines):
                if 'router = ' in line or 'admin_router = ' in line:
                    # Insérer après la définition du router
                    for code in reversed(router_code):
                        lines.insert(i + 2, code)
                    break
    
    # Insérer les routes path
    if path_code:
        if path_insert_idx != -1:
            # Insérer dans urlpatterns
            for i, line in enumerate(lines):
                if 'urlpatterns = [' in line:
                    # Insérer après urlpatterns
                    for code in reversed(path_code):
                        lines.insert(i + 1, code)
                    break
    
    new_content = '\n'.join(lines)
    
    # Écrire le fichier seulement si des changements ont été faits
    if new_content != original_content:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        except Exception as e:
            print(f"  ERREUR lors de l'ecriture: {e}")
            return False
    
    return False

def validate_and_fix():
    """Valide et corrige la structure API"""
    print("=" * 80)
    print("VALIDATION ET CORRECTION DE LA STRUCTURE API")
    print("=" * 80)
    print()
    
    backend_path = Path(__file__).parent
    all_missing = {}
    all_found = {}
    
    # Vérifier chaque module
    for module_name, endpoints in DOCUMENTED_ENDPOINTS.items():
        if module_name == 'auth':
            filepath = backend_path / URLS_FILES.get('auth', 'shalomministry/urls.py')
        elif 'admin' in module_name:
            # Les routes admin sont dans le même fichier que le module parent
            base_module = module_name.replace('_admin', '')
            filepath = backend_path / URLS_FILES.get(base_module, f'api/{base_module}/urls.py')
        else:
            filepath = backend_path / URLS_FILES.get(module_name, f'api/{module_name}/urls.py')
        
        if not filepath.exists():
            print(f"ATTENTION: Fichier {filepath} non trouve")
            continue
        
        content = read_file_content(str(filepath))
        if content is None:
            continue
        
        print(f"Verification: {filepath.name}")
        missing = {}
        found = {}
        
        for endpoint, config in endpoints.items():
            if check_endpoint_exists(endpoint, content, config, str(filepath)):
                found[endpoint] = config
            else:
                missing[endpoint] = config
        
        if found:
            print(f"  [OK] {len(found)} endpoints trouves")
        if missing:
            print(f"  [MANQUANT] {len(missing)} endpoints manquants")
            all_missing[str(filepath)] = missing
        
        all_found[str(filepath)] = found
        print()
    
    # Résumé
    print("=" * 80)
    print("RESUME")
    print("=" * 80)
    total_found = sum(len(f) for f in all_found.values())
    total_missing = sum(len(m) for m in all_missing.values())
    print(f"  [OK] Endpoints trouves: {total_found}")
    print(f"  [MANQUANT] Endpoints manquants: {total_missing}")
    print()
    
    # Proposer de corriger
    if all_missing:
        print("=" * 80)
        print("CORRECTION AUTOMATIQUE")
        print("=" * 80)
        print()
        
        # Mode automatique si --auto est passé en argument
        auto_mode = '--auto' in sys.argv or '-a' in sys.argv
        
        if not auto_mode:
            try:
                response = input("Voulez-vous ajouter automatiquement les routes manquantes? (o/n): ")
            except (EOFError, KeyboardInterrupt):
                print("\nMode non-interactif detecte. Utilisez --auto pour activer le mode automatique.")
                print("\nRoutes manquantes a ajouter manuellement:")
                for filepath, missing_endpoints in all_missing.items():
                    print(f"\n{filepath}:")
                    for endpoint, config in missing_endpoints.items():
                        if config['type'] == 'router':
                            print(f"  {generate_router_code(endpoint, config)}")
                        elif config['type'] == 'path':
                            print(f"  {generate_path_code(endpoint, config)}")
                return False
            
            should_fix = response.lower() in ['o', 'oui', 'y', 'yes']
        else:
            should_fix = True
            print("Mode automatique active.")
        
        if should_fix:
            for filepath, missing_endpoints in all_missing.items():
                print(f"\nCorrection de {filepath}...")
                if fix_urls_file(filepath, missing_endpoints):
                    print(f"  [OK] Fichier corrige")
                else:
                    print(f"  [INFO] Aucune modification necessaire ou erreur")
        else:
            print("\nCorrection annulee.")
            print("\nRoutes manquantes a ajouter manuellement:")
            for filepath, missing_endpoints in all_missing.items():
                print(f"\n{filepath}:")
                for endpoint, config in missing_endpoints.items():
                    if config['type'] == 'router':
                        print(f"  {generate_router_code(endpoint, config)}")
                    elif config['type'] == 'path':
                        print(f"  {generate_path_code(endpoint, config, filepath)}")
    else:
        print("Tous les endpoints sont deja presents!")
    
    return total_missing == 0

if __name__ == '__main__':
    try:
        success = validate_and_fix()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nOperation annulee par l'utilisateur.")
        sys.exit(1)
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

