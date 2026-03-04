# Script PowerShell pour exporter les données Django avec encodage UTF-8
# Usage: .\dumpdata.ps1 [nom_fichier]

param(
    [string]$OutputFile = "data.json"
)

# Activer l'environnement virtuel
if (Test-Path "venv\Scripts\Activate.ps1") {
    .\venv\Scripts\Activate.ps1
} else {
    Write-Host "Erreur: Environnement virtuel non trouvé" -ForegroundColor Red
    exit 1
}

# Configurer l'encodage UTF-8
$env:PYTHONIOENCODING = "utf-8"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Exportation des données vers $OutputFile..." -ForegroundColor Green

# Exécuter dumpdata avec encodage UTF-8 sans BOM
# Utiliser utf8NoBOM pour éviter les problèmes avec Django loaddata
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$content = python manage.py dumpdata --exclude auth.permission --exclude contenttypes 2>&1 | Out-String
$outputPath = Join-Path (Get-Location) $OutputFile
[System.IO.File]::WriteAllText($outputPath, $content, $utf8NoBom)

if ($LASTEXITCODE -eq 0) {
    $fileSize = (Get-Item $OutputFile).Length
    Write-Host "✓ Export réussi! Fichier: $OutputFile ($([math]::Round($fileSize/1KB, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "✗ Erreur lors de l'export" -ForegroundColor Red
    exit 1
}

