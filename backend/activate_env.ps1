# Script PowerShell pour activer l'environnement virtuel
# Usage: .\activate_env.ps1

Write-Host "Activation de l'environnement virtuel..." -ForegroundColor Green
& ".\venv\Scripts\Activate.ps1"

Write-Host "Environnement virtuel activé !" -ForegroundColor Green
Write-Host "Vous pouvez maintenant utiliser: python manage.py [command]" -ForegroundColor Yellow

