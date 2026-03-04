# Script URGENT pour demarrer le serveur Django
# Utilise 0.0.0.0 pour etre accessible sur toutes les interfaces

Write-Host "========================================" -ForegroundColor Red
Write-Host "DEMARRAGE URGENT DU SERVEUR DJANGO" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Changer vers le repertoire backend
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Arreter tous les serveurs existants sur le port 8000
Write-Host "1. Arret des serveurs existants..." -ForegroundColor Yellow
$existingConnections = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($existingConnections) {
    foreach ($conn in $existingConnections) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "   OK: Serveurs arretes" -ForegroundColor Green
} else {
    Write-Host "   OK: Aucun serveur en cours" -ForegroundColor Green
}

Write-Host ""

# Activer l'environnement virtuel
Write-Host "2. Activation de l'environnement virtuel..." -ForegroundColor Yellow
if (Test-Path ".\venv\Scripts\Activate.ps1") {
    & ".\venv\Scripts\Activate.ps1"
    Write-Host "   OK: Environnement virtuel active" -ForegroundColor Green
} else {
    Write-Host "   ERREUR: Environnement virtuel non trouve" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Afficher les adresses IP disponibles
Write-Host "3. Adresses IP disponibles:" -ForegroundColor Yellow
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*"
} | Select-Object IPAddress, InterfaceAlias

foreach ($ip in $ipAddresses) {
    $adapter = Get-NetAdapter | Where-Object { $_.InterfaceIndex -eq (Get-NetIPAddress -IPAddress $ip.IPAddress).InterfaceIndex }
    $status = if ($adapter -and $adapter.Status -eq "Up") { "ACTIF" } else { "INACTIF" }
    $color = if ($status -eq "ACTIF") { "Green" } else { "Gray" }
    Write-Host "   - $($ip.IPAddress) ($($ip.InterfaceAlias)) - $status" -ForegroundColor $color
}

Write-Host ""

# Demarrer le serveur sur 0.0.0.0
Write-Host "4. Demarrage du serveur sur 0.0.0.0:8000..." -ForegroundColor Yellow
Write-Host "   Le serveur sera accessible sur TOUTES les adresses IP ci-dessus" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "SERVEUR EN COURS DE DEMARRAGE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Le serveur sera accessible sur:" -ForegroundColor White
foreach ($ip in $ipAddresses) {
    Write-Host "   http://$($ip.IPAddress):8000/" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "IMPORTANT: Mettez a jour le frontend pour utiliser une de ces adresses!" -ForegroundColor Yellow
Write-Host "   Ou utilisez 0.0.0.0 dans le frontend (sera resolu automatiquement)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arreter le serveur" -ForegroundColor Gray
Write-Host ""

# Demarrer le serveur
python manage.py runserver 0.0.0.0:8000

