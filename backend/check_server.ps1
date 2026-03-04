# Script PowerShell pour vérifier l'état du serveur Django
# Usage: .\check_server.ps1

Write-Host "🔍 Vérification de l'état du serveur Django" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier si le serveur est en cours d'exécution
Write-Host "[1/5] Vérification des processus Python Django..." -ForegroundColor Yellow
$pythonProcesses = Get-Process python -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*venv*" -or $_.CommandLine -like "*manage.py*" -or $_.CommandLine -like "*runserver*"
}

if ($pythonProcesses) {
    Write-Host "   ✅ Processus Python Django trouvé(s):" -ForegroundColor Green
    foreach ($proc in $pythonProcesses) {
        Write-Host "      - PID: $($proc.Id) | Nom: $($proc.ProcessName)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Aucun processus Django trouvé" -ForegroundColor Red
    Write-Host "   💡 Le serveur n'est probablement pas démarré" -ForegroundColor Yellow
}
Write-Host ""

# 2. Vérifier si le port 8000 est utilisé
Write-Host "[2/5] Vérification du port 8000..." -ForegroundColor Yellow
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if ($port8000) {
    Write-Host "   ✅ Le port 8000 est utilisé:" -ForegroundColor Green
    foreach ($conn in $port8000) {
        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        Write-Host "      - État: $($conn.State) | Processus: $($process.ProcessName) (PID: $($conn.OwningProcess))" -ForegroundColor Gray
        Write-Host "      - Adresse locale: $($conn.LocalAddress):$($conn.LocalPort)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Le port 8000 n'est pas utilisé" -ForegroundColor Red
    Write-Host "   💡 Le serveur n'écoute probablement pas sur ce port" -ForegroundColor Yellow
}
Write-Host ""

# 3. Vérifier l'adresse IP locale
Write-Host "[3/5] Vérification de l'adresse IP..." -ForegroundColor Yellow
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -like "10.10.107.*" -or $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "172.*"
}

if ($ipAddresses) {
    Write-Host "   ✅ Adresses IP trouvées:" -ForegroundColor Green
    foreach ($ip in $ipAddresses) {
        $isTarget = $ip.IPAddress -eq "10.10.107.14"
        $marker = if ($isTarget) { " ⭐ (Cible)" } else { "" }
        Write-Host "      - $($ip.IPAddress)$marker" -ForegroundColor $(if ($isTarget) { "Green" } else { "Gray" })
    }
    
    $targetIP = $ipAddresses | Where-Object { $_.IPAddress -eq "10.10.107.14" }
    if (-not $targetIP) {
        Write-Host "   ⚠️  L'adresse 10.10.107.14 n'est pas trouvée sur cette machine" -ForegroundColor Yellow
        Write-Host "   💡 Utilisez une des adresses IP ci-dessus ou localhost" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Aucune adresse IP locale trouvée" -ForegroundColor Red
}
Write-Host ""

# 4. Tester la connexion au serveur
Write-Host "[4/5] Test de connexion au serveur..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://10.10.107.14:8000/api/" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Connexion réussie! (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   ⚠️  Le serveur répond mais avec une erreur (Status: $statusCode)" -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*timeout*" -or $_.Exception.Message -like "*refused*") {
        Write-Host "   ❌ Impossible de se connecter au serveur" -ForegroundColor Red
        Write-Host "      Erreur: $($_.Exception.Message)" -ForegroundColor Gray
        Write-Host "   💡 Le serveur n'est probablement pas démarré ou n'écoute pas sur 10.10.107.14:8000" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# 5. Vérifier le firewall
Write-Host "[5/5] Vérification du firewall..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "*Django*" -ErrorAction SilentlyContinue
if ($firewallRule) {
    Write-Host "   ✅ Règle de firewall trouvée pour Django" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Aucune règle de firewall spécifique pour Django" -ForegroundColor Yellow
    Write-Host "   💡 Le port 8000 peut être bloqué. Créez une règle avec:" -ForegroundColor Yellow
    Write-Host "      New-NetFirewallRule -DisplayName 'Django Dev Server' -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow" -ForegroundColor Gray
}
Write-Host ""

# Résumé et recommandations
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "📋 RÉSUMÉ ET RECOMMANDATIONS" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

if (-not $pythonProcesses -or -not $port8000) {
    Write-Host "❌ Le serveur Django n'est pas démarré" -ForegroundColor Red
    Write-Host ""
    Write-Host "🚀 Pour démarrer le serveur:" -ForegroundColor Green
    Write-Host "   1. Ouvrez un terminal dans le dossier backend" -ForegroundColor White
    Write-Host "   2. Exécutez: .\start_dev.ps1" -ForegroundColor White
    Write-Host "   3. Attendez le message: 'Starting development server at http://10.10.107.14:8000/'" -ForegroundColor White
    Write-Host ""
} elseif ($response) {
    Write-Host "✅ Le serveur Django fonctionne correctement!" -ForegroundColor Green
    Write-Host "   Le frontend devrait pouvoir se connecter." -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️  Le serveur semble démarré mais la connexion échoue" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Vérifications supplémentaires:" -ForegroundColor Yellow
    Write-Host "   1. Vérifiez que le serveur écoute sur 10.10.107.14:8000 (pas 127.0.0.1)" -ForegroundColor White
    Write-Host "   2. Vérifiez le firewall Windows" -ForegroundColor White
    Write-Host "   3. Vérifiez que l'adresse IP 10.10.107.14 est correcte" -ForegroundColor White
    Write-Host ""
}

Write-Host "Pour plus d'aide, consultez: backend/TROUBLESHOOTING.md" -ForegroundColor Cyan

