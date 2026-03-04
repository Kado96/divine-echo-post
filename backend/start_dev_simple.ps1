# Script simplifie pour demarrer Django
# Utilise 0.0.0.0 pour ecouter sur toutes les interfaces

Write-Host "Demarrage du serveur Django..." -ForegroundColor Green

# Changer vers le repertoire backend
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Activer l'environnement virtuel
if (Test-Path ".\venv\Scripts\Activate.ps1") {
    & ".\venv\Scripts\Activate.ps1"
    Write-Host "OK: Environnement virtuel active" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Environnement virtuel non trouve" -ForegroundColor Red
    exit 1
}

# Verifier que manage.py existe
if (-not (Test-Path ".\manage.py")) {
    Write-Host "ERREUR: manage.py non trouve" -ForegroundColor Red
    exit 1
}

# Verifier que le port 8000 n'est pas deja utilise
$portInUse = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "ATTENTION: Le port 8000 est deja utilise!" -ForegroundColor Yellow
    Write-Host "   Arretez le serveur existant ou utilisez un autre port" -ForegroundColor Yellow
    Write-Host ""
}

# Utiliser 0.0.0.0 pour ecouter sur toutes les interfaces
# Cela permet au serveur d'etre accessible sur toutes les adresses IP de la machine
Write-Host "Demarrage du serveur sur 0.0.0.0:8000..." -ForegroundColor Yellow
Write-Host "Le serveur sera accessible sur toutes les adresses IP de cette machine:" -ForegroundColor Cyan

# Afficher les adresses IP disponibles
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*"
} | Select-Object -ExpandProperty IPAddress

foreach ($ip in $ipAddresses) {
    Write-Host "  - http://$ip:8000/" -ForegroundColor White
}

Write-Host ""
Write-Host "Serveur en cours de demarrage..." -ForegroundColor Cyan
Write-Host "   Appuyez sur Ctrl+C pour arreter" -ForegroundColor Gray
Write-Host ""

& ".\venv\Scripts\python.exe" manage.py runserver 0.0.0.0:8000

