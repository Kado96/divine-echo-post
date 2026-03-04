# Script PowerShell pour démarrer le serveur Django
# Usage: .\run_server.ps1

Write-Host "🚀 Démarrage du serveur Django..." -ForegroundColor Green

# Activer l'environnement virtuel
if (Test-Path ".\venv\Scripts\Activate.ps1") {
    & ".\venv\Scripts\Activate.ps1"
    Write-Host "✅ Environnement virtuel activé" -ForegroundColor Green
} else {
    Write-Host "❌ Environnement virtuel non trouvé dans .\venv\Scripts\Activate.ps1" -ForegroundColor Red
    exit 1
}

# Vérifier que manage.py existe
if (-not (Test-Path ".\manage.py")) {
    Write-Host "❌ manage.py non trouvé dans le répertoire actuel" -ForegroundColor Red
    Write-Host "💡 Assurez-vous d'être dans le dossier backend" -ForegroundColor Yellow
    exit 1
}

Write-Host "📡 Démarrage du serveur sur http://localhost:8000" -ForegroundColor Cyan
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""

# Démarrer le serveur
& ".\venv\Scripts\python.exe" manage.py runserver

