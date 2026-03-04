# 🚨 Correction Rapide : ERR_CONNECTION_TIMED_OUT

## ⚡ Solution Immédiate

Le serveur Django n'est **pas accessible** sur `10.10.107.14:8000`.

### Étape 1 : Vérifier l'état actuel

```powershell
cd backend
Get-NetTCPConnection -LocalPort 8000
```

Si vous voyez `127.0.0.1:8000`, le serveur écoute sur la mauvaise adresse.

### Étape 2 : Arrêter le serveur actuel

Si un serveur est en cours d'exécution :

1. Trouvez le processus :
   ```powershell
   Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess
   ```

2. Arrêtez-le :
   ```powershell
   Stop-Process -Id <PID> -Force
   ```

### Étape 3 : Démarrer le serveur sur la bonne adresse

```powershell
cd backend
.\start_dev.ps1
```

**⚠️ VÉRIFIEZ** que le message de démarrage affiche :
```
Starting development server at http://10.10.107.14:8000/
```

**❌ Si vous voyez** :
```
Starting development server at http://127.0.0.1:8000/
```

**Arrêtez le serveur (Ctrl+C) et redémarrez-le.**

## 🔍 Vérification

Une fois le serveur démarré, testez dans votre navigateur ou avec curl :

```powershell
# Test de connexion
Invoke-WebRequest -Uri "http://10.10.107.14:8000/api/settings/current/" -Method GET
```

Si cela fonctionne, le frontend devrait maintenant pouvoir se connecter.

## 📋 Checklist

- [ ] Le serveur Django est démarré
- [ ] Le serveur écoute sur `10.10.107.14:8000` (pas `127.0.0.1:8000`)
- [ ] Le port 8000 est accessible
- [ ] Les endpoints répondent (`/api/settings/current/`, `/api/login/`)

## 🆘 Si le problème persiste

1. **Vérifiez le firewall** :
   ```powershell
   New-NetFirewallRule -DisplayName "Django Dev Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
   ```

2. **Vérifiez votre adresse IP** :
   ```powershell
   ipconfig
   ```
   Assurez-vous que `10.10.107.14` est bien votre adresse IP.

3. **Consultez les guides** :
   - `backend/SERVER_FIX_GUIDE.md`
   - `backend/TROUBLESHOOTING.md`

