# Script pour arrêter le serveur sur 127.0.0.1 et le redémarrer sur 10.10.107.14

Write-Host "Correction de l'adresse du serveur Django" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Trouver et arrêter les processus Django sur le port 8000
Write-Host "1. Arret des serveurs Django existants..." -ForegroundColor Yellow

$connections = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "   Arret du processus PID $($conn.OwningProcess)..." -ForegroundColor Gray
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "   OK: Processus arretes" -ForegroundColor Green
} else {
    Write-Host "   OK: Aucun serveur en cours d'execution" -ForegroundColor Green
}

Write-Host ""

# Vérifier que le port est libre
Write-Host "2. Verification que le port 8000 est libre..." -ForegroundColor Yellow
$portCheck = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host "   ERREUR: Le port 8000 est encore utilise" -ForegroundColor Red
    exit 1
} else {
    Write-Host "   OK: Port 8000 libre" -ForegroundColor Green
}

Write-Host ""

# Démarrer le serveur sur la bonne adresse
Write-Host "3. Demarrage du serveur sur 10.10.107.14:8000..." -ForegroundColor Yellow

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Vérifier l'environnement virtuel
$venvPython = Join-Path $scriptPath "venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "   ERREUR: Environnement virtuel non trouve" -ForegroundColor Red
    exit 1
}

# Démarrer le serveur en arrière-plan
Write-Host "   Demarrage en cours..." -ForegroundColor Gray
$process = Start-Process -FilePath $venvPython -ArgumentList "manage.py", "runserver", "10.10.107.14:8000" -WorkingDirectory $scriptPath -WindowStyle Hidden -PassThru

# Attendre que le serveur démarre
Write-Host "   Attente du demarrage..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Vérifier que le serveur écoute sur la bonne adresse
$newConnections = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($newConnections) {
    $correctAddress = $newConnections | Where-Object { $_.LocalAddress -eq "10.10.107.14" }
    if ($correctAddress) {
        Write-Host "   OK: Serveur demarre sur 10.10.107.14:8000" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "SERVEUR CORRIGE ET DEMARRE" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Le serveur est maintenant accessible sur:" -ForegroundColor Cyan
        Write-Host "  http://10.10.107.14:8000/" -ForegroundColor White
        Write-Host ""
        Write-Host "Le frontend devrait maintenant pouvoir se connecter." -ForegroundColor Green
    } else {
        $wrongAddress = $newConnections | Where-Object { $_.LocalAddress -eq "127.0.0.1" }
        if ($wrongAddress) {
            Write-Host "   ATTENTION: Le serveur ecoute encore sur 127.0.0.1" -ForegroundColor Yellow
            Write-Host "   Arret du processus et nouvelle tentative..." -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            # Réessayer avec start_dev.ps1
            & ".\start_dev.ps1"
        } else {
            Write-Host "   INFO: Serveur demarre sur $($newConnections[0].LocalAddress)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ERREUR: Le serveur ne semble pas avoir demarre" -ForegroundColor Red
    Write-Host "   Essayez de demarrer manuellement avec:" -ForegroundColor Yellow
    Write-Host "     .\start_dev.ps1" -ForegroundColor White
}

