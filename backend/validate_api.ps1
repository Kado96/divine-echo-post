# Script de validation de la structure API
# Vérifie que tous les endpoints documentés existent dans le code

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VALIDATION DE LA STRUCTURE API" -ForegroundColor Cyan
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
    # Essayer le répertoire courant
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

# Exécuter le script de validation Python
Write-Host "Execution de la validation..." -ForegroundColor Yellow
Write-Host ""

$scriptPath = Join-Path $backendPath "validate_api_structure.py"
& $venvPython $scriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "VALIDATION REUSSIE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "VALIDATION AVEC AVERTISSEMENTS" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
}

