# Script PowerShell pour demarrer Django avec CORS personnalise
Write-Host "Demarrage du serveur Django avec CORS personnalise..." -ForegroundColor Green

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

# Utiliser localhost pour le developpement (proxy Vite)
$targetIP = "127.0.0.1"
$ipConfig = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -eq $targetIP }

# Utiliser localhost pour le developpement (proxy Vite)
Write-Host "Demarrage du serveur sur localhost:8000..." -ForegroundColor Yellow
Write-Host "Le proxy Vite redirigera les requetes /api vers ce serveur" -ForegroundColor Cyan
$serverAddress = "127.0.0.1:8000"

Write-Host "Cela resout l'avertissement Chrome sur les requetes non-publiques" -ForegroundColor Cyan
Write-Host ""

# Demarrer Django
Write-Host "Serveur en cours de demarrage sur http://$serverAddress..." -ForegroundColor Cyan
Write-Host "   Appuyez sur Ctrl+C pour arreter" -ForegroundColor Gray
Write-Host ""

& ".\venv\Scripts\python.exe" manage.py runserver $serverAddress
