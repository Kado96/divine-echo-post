# Script pour trouver l'adresse IP et configurer le serveur Django

Write-Host "Recherche de l'adresse IP de cette machine..." -ForegroundColor Cyan
Write-Host ""

# Obtenir toutes les adresses IP IPv4 (sauf localhost et APIPA)
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*"
} | Select-Object IPAddress, InterfaceAlias

if ($ipAddresses) {
    Write-Host "Adresses IP trouvees:" -ForegroundColor Green
    $index = 1
    $ipList = @()
    foreach ($ip in $ipAddresses) {
        Write-Host "  [$index] $($ip.IPAddress) - $($ip.InterfaceAlias)" -ForegroundColor White
        $ipList += $ip.IPAddress
        $index++
    }
    Write-Host ""
    
    # Vérifier si 10.10.107.14 est dans la liste
    $targetIP = $ipList | Where-Object { $_ -eq "10.10.107.14" }
    
    if ($targetIP) {
        Write-Host "OK: L'adresse 10.10.107.14 est disponible sur cette machine" -ForegroundColor Green
        Write-Host ""
        Write-Host "Le serveur peut etre demarre avec:" -ForegroundColor Cyan
        Write-Host "  .\start_dev.ps1" -ForegroundColor White
    } else {
        Write-Host "ATTENTION: L'adresse 10.10.107.14 n'est pas disponible sur cette machine" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Options:" -ForegroundColor Cyan
        Write-Host "  1. Utiliser une des adresses IP ci-dessus" -ForegroundColor White
        Write-Host "  2. Utiliser 0.0.0.0 pour ecouter sur toutes les interfaces" -ForegroundColor White
        Write-Host "  3. Utiliser localhost (127.0.0.1) si le frontend est sur la meme machine" -ForegroundColor White
        Write-Host ""
        
        Write-Host "Pour utiliser une autre adresse IP, modifiez start_dev.ps1:" -ForegroundColor Yellow
        Write-Host "  python manage.py runserver <IP>:8000" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Ou utilisez 0.0.0.0 pour ecouter sur toutes les interfaces:" -ForegroundColor Yellow
        Write-Host "  python manage.py runserver 0.0.0.0:8000" -ForegroundColor Gray
    }
} else {
    Write-Host "ERREUR: Aucune adresse IP trouvee" -ForegroundColor Red
    Write-Host ""
    Write-Host "Utilisez localhost ou 0.0.0.0:" -ForegroundColor Yellow
    Write-Host "  python manage.py runserver 0.0.0.0:8000" -ForegroundColor Gray
}

Write-Host ""

