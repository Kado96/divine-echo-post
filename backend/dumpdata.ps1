# Script PowerShell pour exporter les données Django avec encodage UTF-8
# Usage: .\dumpdata.ps1 [nom_fichier]

param(
    [string]$OutputFile = "data.json"
)

# Activer l'environnement virtuel
if (Test-Path "venv\Scripts\Activate.ps1") {
    . .\venv\Scripts\Activate.ps1
} else {
    Write-Host "Erreur: Environnement virtuel non trouve" -ForegroundColor Red
    exit 1
}

# Configurer l'encodage UTF-8
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Exportation des donnees vers $OutputFile..." -ForegroundColor Green

# Executer dumpdata
# On utilise --indent 2 pour la lisibilité
python manage.py dumpdata --exclude auth.permission --exclude contenttypes --indent 2 --output $OutputFile

if ($LASTEXITCODE -eq 0) {
    if (Test-Path $OutputFile) {
        $fileSize = (Get-Item $OutputFile).Length
        $sizeKB = [math]::Round($fileSize / 1024, 2)
        Write-Host "OK - Export reussi! Fichier: $OutputFile ($sizeKB KB)" -ForegroundColor Green
    } else {
        Write-Host "Erreur: Le fichier $OutputFile n'a pas ete cree" -ForegroundColor Red
    }
} else {
    Write-Host "Erreur lors de l'export" -ForegroundColor Red
    exit 1
}


