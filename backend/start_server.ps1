# Script PowerShell pour démarrer le serveur Django
# Usage: .\start_server.ps1

Write-Host "Activation de l'environnement virtuel..." -ForegroundColor Green
& ".\venv\Scripts\Activate.ps1"

Write-Host "Démarrage du serveur Django..." -ForegroundColor Green
python manage.py runserver

