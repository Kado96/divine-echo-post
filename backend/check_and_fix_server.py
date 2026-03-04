"""
Script de vérification et correction du serveur Django

Vérifie que le serveur Django est démarré et accessible,
et le démarre automatiquement si nécessaire.
"""

import os
import sys
import socket
import subprocess
import time
import requests
from pathlib import Path

def check_port_open(host: str, port: int, timeout: int = 2) -> bool:
    """Vérifie si un port est ouvert"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception:
        return False

def check_server_running(host: str = '10.10.107.14', port: int = 8000) -> bool:
    """Vérifie si le serveur Django est en cours d'exécution"""
    return check_port_open(host, port)

def check_endpoint_accessible(url: str, timeout: int = 5) -> tuple[bool, str]:
    """Vérifie si un endpoint est accessible"""
    try:
        response = requests.get(url, timeout=timeout)
        return True, f"Status: {response.status_code}"
    except requests.exceptions.ConnectionError:
        return False, "Connection refused - Serveur non accessible"
    except requests.exceptions.Timeout:
        return False, "Timeout - Serveur ne répond pas"
    except Exception as e:
        return False, f"Erreur: {str(e)}"

def find_django_process() -> bool:
    """Vérifie si un processus Django est en cours d'exécution"""
    try:
        if sys.platform == 'win32':
            # Windows
            result = subprocess.run(
                ['tasklist', '/FI', 'IMAGENAME eq python.exe'],
                capture_output=True,
                text=True
            )
            # Vérifier si manage.py runserver est dans les processus
            result2 = subprocess.run(
                ['wmic', 'process', 'where', "commandline like '%manage.py%runserver%'", 'get', 'processid'],
                capture_output=True,
                text=True
            )
            return 'processid' in result2.stdout.lower() and result2.stdout.strip() != 'ProcessId'
        else:
            # Linux/Mac
            result = subprocess.run(
                ['pgrep', '-f', 'manage.py runserver'],
                capture_output=True
            )
            return result.returncode == 0
    except Exception:
        return False

def start_django_server(host: str = '10.10.107.14', port: int = 8000, background: bool = True) -> bool:
    """Démarre le serveur Django"""
    backend_path = Path(__file__).parent
    
    # Vérifier l'environnement virtuel
    venv_python = backend_path / 'venv' / 'Scripts' / 'python.exe'
    if not venv_python.exists():
        venv_python = backend_path / 'venv' / 'bin' / 'python'
        if not venv_python.exists():
            print("ERREUR: Environnement virtuel non trouve")
            return False
    
    manage_py = backend_path / 'manage.py'
    if not manage_py.exists():
        print("ERREUR: manage.py non trouve")
        return False
    
    print(f"Demarrage du serveur Django sur {host}:{port}...")
    
    try:
        if background:
            if sys.platform == 'win32':
                # Windows - démarrer en arrière-plan
                cmd = [
                    str(venv_python),
                    str(manage_py),
                    'runserver',
                    f'{host}:{port}'
                ]
                # Utiliser CREATE_NEW_CONSOLE pour démarrer dans une nouvelle fenêtre
                subprocess.Popen(
                    cmd,
                    cwd=str(backend_path),
                    creationflags=subprocess.CREATE_NEW_CONSOLE
                )
            else:
                # Linux/Mac - démarrer en arrière-plan
                cmd = [
                    str(venv_python),
                    str(manage_py),
                    'runserver',
                    f'{host}:{port}'
                ]
                subprocess.Popen(
                    cmd,
                    cwd=str(backend_path),
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
        else:
            # Mode interactif (bloquant)
            cmd = [
                str(venv_python),
                str(manage_py),
                'runserver',
                f'{host}:{port}'
            ]
            subprocess.run(cmd, cwd=str(backend_path))
            return True
        
        # Attendre que le serveur démarre
        print("Attente du demarrage du serveur...")
        for i in range(10):
            time.sleep(1)
            if check_server_running(host, port):
                print(f"OK: Serveur demarre sur {host}:{port}")
                return True
            print(f"  Tentative {i+1}/10...")
        
        print("ATTENTION: Le serveur semble avoir demarre mais n'est pas encore accessible")
        return False
        
    except Exception as e:
        print(f"ERREUR lors du demarrage: {e}")
        return False

def check_and_fix():
    """Vérifie et corrige les problèmes de connexion"""
    print("=" * 80)
    print("VERIFICATION ET CORRECTION DU SERVEUR DJANGO")
    print("=" * 80)
    print()
    
    host = '10.10.107.14'
    port = 8000
    base_url = f'http://{host}:{port}'
    
    # 1. Vérifier si le port est ouvert
    print(f"1. Verification du port {port} sur {host}...")
    if check_server_running(host, port):
        print(f"  [OK] Port {port} ouvert")
    else:
        print(f"  [MANQUANT] Port {port} ferme")
        print()
        
        # Vérifier si un processus Django est en cours
        print("2. Verification des processus Django...")
        if find_django_process():
            print("  [INFO] Processus Django detecte mais port non accessible")
            print("  [INFO] Le serveur peut etre en cours de demarrage ou ecouter sur une autre adresse")
        else:
            print("  [MANQUANT] Aucun processus Django detecte")
        
        print()
        print("=" * 80)
        print("CORRECTION AUTOMATIQUE")
        print("=" * 80)
        print()
        
        # Mode automatique si --auto est passé
        auto_mode = '--auto' in sys.argv or '-a' in sys.argv
        
        if not auto_mode:
            try:
                response = input("Voulez-vous demarrer le serveur automatiquement? (o/n): ")
            except (EOFError, KeyboardInterrupt):
                print("\nMode non-interactif detecte. Utilisez --auto pour activer le mode automatique.")
                print(f"\nPour demarrer manuellement:")
                print(f"  cd backend")
                print(f"  .\\start_dev.ps1")
                return False
            
            should_start = response.lower() in ['o', 'oui', 'y', 'yes']
        else:
            should_start = True
            print("Mode automatique active.")
        
        if should_start:
            if start_django_server(host, port, background=True):
                print()
                print("Attente de 3 secondes pour que le serveur soit pret...")
                time.sleep(3)
            else:
                print("ERREUR: Impossible de demarrer le serveur")
                return False
        else:
            print("\nDemarrage annule.")
            print(f"\nPour demarrer manuellement:")
            print(f"  cd backend")
            print(f"  .\\start_dev.ps1")
            return False
    
    print()
    
    # 2. Vérifier les endpoints critiques
    print("2. Verification des endpoints critiques...")
    print()
    
    endpoints_to_check = [
        ('/api/settings/current/', 'GET'),
        ('/api/login/', 'POST'),
    ]
    
    all_ok = True
    for endpoint, method in endpoints_to_check:
        url = f'{base_url}{endpoint}'
        print(f"  Verification: {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = requests.get(url, timeout=5)
            elif method == 'POST':
                # Pour POST, on envoie des données vides juste pour tester la connexion
                response = requests.post(url, json={}, timeout=5)
            
            if response.status_code in [200, 400, 401, 403, 404, 405]:
                print(f"    [OK] Endpoint accessible (Status: {response.status_code})")
            else:
                print(f"    [ATTENTION] Endpoint accessible mais status inattendu: {response.status_code}")
                all_ok = False
        except requests.exceptions.ConnectionError:
            print(f"    [ERREUR] Connection refused - Serveur non accessible")
            all_ok = False
        except requests.exceptions.Timeout:
            print(f"    [ERREUR] Timeout - Serveur ne repond pas")
            all_ok = False
        except Exception as e:
            print(f"    [ERREUR] {str(e)}")
            all_ok = False
    
    print()
    print("=" * 80)
    if all_ok:
        print("VALIDATION REUSSIE")
        print("=" * 80)
        print("Le serveur Django est accessible et les endpoints repondent correctement.")
        return True
    else:
        print("VALIDATION AVEC ERREURS")
        print("=" * 80)
        print("Certains endpoints ne sont pas accessibles.")
        print("\nVerifications a effectuer:")
        print("  1. Le serveur Django est-il demarre?")
        print("  2. Le serveur ecoute-t-il sur 10.10.107.14:8000?")
        print("  3. Le firewall bloque-t-il le port 8000?")
        print("  4. L'adresse IP 10.10.107.14 est-elle correcte?")
        return False

if __name__ == '__main__':
    try:
        # Installer requests si nécessaire
        try:
            import requests
        except ImportError:
            print("Installation de la bibliotheque 'requests'...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'requests'])
            import requests
        
        success = check_and_fix()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nOperation annulee par l'utilisateur.")
        sys.exit(1)
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

