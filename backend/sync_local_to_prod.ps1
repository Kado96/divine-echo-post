# Script PowerShell pour synchroniser les donnees local -> production
# Usage: .\sync_local_to_prod.ps1 [-DryRun] [-Confirm]
# Encoding: UTF-8

param(
    [switch]$DryRun,
    [switch]$Confirm
)

# Configurer l'encodage de sortie
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "[SYNC] Script de synchronisation Local -> Production" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan

# Changer vers le repertoire backend (si necessaire)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($scriptPath) {
    Set-Location $scriptPath
}

Write-Host "[INFO] Repertoire de travail: $(Get-Location)" -ForegroundColor Yellow

# Vérifier que l'environnement virtuel existe et trouver Python
$venvPython = Join-Path (Get-Location) "venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "[ERREUR] Environnement virtuel non trouve dans .\venv\" -ForegroundColor Red
    Write-Host "[INFO] Creez un environnement virtuel avec: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

# Utiliser le Python de l'environnement virtuel directement
Write-Host "[INFO] Utilisation de l'environnement virtuel: $venvPython" -ForegroundColor Green

# Vérifier que Python fonctionne
try {
    $pythonVersion = & $venvPython --version 2>&1
    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
        throw "Impossible d'executer Python"
    }
    Write-Host "[OK] Python detecte: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Erreur avec Python: $_" -ForegroundColor Red
    Write-Host "[INFO] Verifiez que l'environnement virtuel est correctement installe" -ForegroundColor Yellow
    exit 1
}

# Vérifier que DATABASE_URL est défini
if (-not $env:DATABASE_URL) {
    Write-Host "[ATTENTION] DATABASE_URL n'est pas defini" -ForegroundColor Yellow
    Write-Host "[INFO] Definissez la variable d'environnement DATABASE_URL avec l'URL Supabase" -ForegroundColor Yellow
    Write-Host "        Exemple: `$env:DATABASE_URL = 'postgresql://user:pass@host:5432/db'" -ForegroundColor Gray
    
    $continue = Read-Host "Voulez-vous continuer quand meme? (o/n)"
    if ($continue -notmatch "^[oO]") {
        Write-Host "[ANNULATION] Synchronisation annulee" -ForegroundColor Red
        exit 1
    }
}

# Construire la commande Python
$pythonArgs = @("sync_local_to_prod.py")
if ($DryRun) {
    $pythonArgs += "--dry-run"
    Write-Host "[MODE] DRY-RUN active (simulation)" -ForegroundColor Yellow
}
if ($Confirm) {
    $pythonArgs += "--confirm"
    Write-Host "[MODE] CONFIRM active (confirmation requise)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[EXECUTION] Lancement du script de synchronisation..." -ForegroundColor Green
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""

# Exécuter le script Python avec le Python de l'environnement virtuel
try {
    & $venvPython $pythonArgs
    $exitCode = $LASTEXITCODE
    if ($null -eq $exitCode) {
        $exitCode = 0
    }
} catch {
    Write-Host "[ERREUR] Erreur lors de l'execution: $_" -ForegroundColor Red
    $exitCode = 1
}

Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "[SUCCES] Synchronisation terminee avec succes" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Synchronisation terminee avec des erreurs (code: $exitCode)" -ForegroundColor Red
    Write-Host "[INFO] Consultez le fichier sync_log.txt pour plus de details" -ForegroundColor Yellow
}

exit $exitCode
