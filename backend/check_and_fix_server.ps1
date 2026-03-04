# Script PowerShell pour vérifier et corriger le serveur Django
# Vérifie que le serveur est démarré et accessible, et le démarre si nécessaire

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION ET CORRECTION DU SERVEUR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Obtenir le chemin du script
if ($PSScriptRoot) {
    $backendPath = $PSScriptRoot
} else {
    $backendPath = Split-Path -Parent $MyInvocation.MyCommand.Path
}

# Changer vers le répertoire backend si nécessaire
if (-not (Test-Path (Join-Path $backendPath "shalomministry"))) {
    $currentPath = Get-Location
    if (Test-Path (Join-Path $currentPath "shalomministry")) {
        $backendPath = $currentPath
    } else {
        Write-Host "ERREUR: Ce script doit etre execute depuis le repertoire backend" -ForegroundColor Red
        exit 1
    }
}

# Vérifier l'environnement virtuel
$venvPython = Join-Path $backendPath "venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "ERREUR: Environnement virtuel non trouve" -ForegroundColor Red
    Write-Host "   Creez un environnement virtuel avec: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

Write-Host "OK: Environnement virtuel trouve" -ForegroundColor Green
Write-Host ""

# Vérifier si requests est installé
Write-Host "Verification de la bibliotheque 'requests'..." -ForegroundColor Yellow
$checkRequests = & $venvPython -c "import requests; print('OK')" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installation de 'requests'..." -ForegroundColor Yellow
    & $venvPython -m pip install requests --quiet
}

Write-Host ""

# Exécuter le script de vérification
Write-Host "Execution de la verification..." -ForegroundColor Yellow
Write-Host ""

$scriptPath = Join-Path $backendPath "check_and_fix_server.py"

# Passer --auto si demandé
$autoMode = $args -contains "--auto" -or $args -contains "-a"
if ($autoMode) {
    & $venvPython $scriptPath --auto
} else {
    & $venvPython $scriptPath
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "VERIFICATION TERMINEE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "VERIFICATION TERMINEE AVEC ERREURS" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
}

