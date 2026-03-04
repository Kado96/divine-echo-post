# 🔧 Guide de Dépannage - Connexion Frontend ↔ Backend

## ❌ Erreur : `ERR_CONNECTION_TIMED_OUT` sur `10.10.107.14:8000`

Cette erreur indique que le frontend ne peut pas se connecter au backend Django.

## 🔍 Diagnostic rapide

**Utilisez le script de vérification automatique :**
```powershell
cd backend
.\check_server.ps1
```

Ce script vérifie automatiquement :
- Si le serveur Django est démarré
- Si le port 8000 est utilisé
- Si l'adresse IP est correcte
- Si la connexion fonctionne
- Si le firewall bloque le port

## 🔍 Diagnostic étape par étape

### 1. Vérifier que le serveur Django est en cours d'exécution

**PowerShell :**
```powershell
# Vérifier si le processus Python Django est actif
Get-Process python | Where-Object {$_.Path -like "*venv*"}
```

**Ou vérifier manuellement :**
- Ouvrez un terminal dans le dossier `backend`
- Vous devriez voir un message comme : `Starting development server at http://10.10.107.14:8000/`

### 2. Démarrer le serveur Django

**Option A : Script PowerShell (recommandé)**
```powershell
cd backend
.\start_dev.ps1
```

**Option B : Script Batch**
```cmd
cd backend
start_dev.bat
```

**Option C : Commande manuelle**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 10.10.107.14:8000
```

### 3. Vérifier que le serveur écoute sur la bonne adresse

Le serveur doit afficher :
```
Starting development server at http://10.10.107.14:8000/
Quit the server with CTRL-BREAK.
```

Si vous voyez `127.0.0.1:8000` ou `localhost:8000`, le serveur n'écoute pas sur la bonne adresse.

### 4. Vérifier la configuration réseau

**Vérifier votre adresse IP :**
```powershell
# PowerShell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "10.10.107.*"}
```

**Tester la connexion :**
```powershell
# Tester si le port 8000 est accessible
Test-NetConnection -ComputerName 10.10.107.14 -Port 8000
```

### 5. Vérifier le firewall Windows

Le firewall peut bloquer le port 8000. Pour autoriser :

**PowerShell (en tant qu'administrateur) :**
```powershell
New-NetFirewallRule -DisplayName "Django Dev Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

**Ou via l'interface graphique :**
1. Ouvrez "Pare-feu Windows Defender"
2. Paramètres avancés
3. Règles de trafic entrant > Nouvelle règle
4. Port > TCP > 8000 > Autoriser la connexion

### 6. Vérifier la configuration CORS

Assurez-vous que le middleware CORS est configuré dans `settings.py` pour autoriser les requêtes depuis le frontend.

### 7. Vérifier l'URL du frontend

Dans `frontend/src/lib/api.ts`, vérifiez que l'URL de l'API pointe vers :
```typescript
http://10.10.107.14:8000
```

## 🚀 Solutions rapides

### Solution 1 : Redémarrer le serveur Django

1. Arrêtez le serveur (Ctrl+C)
2. Redémarrez avec :
   ```powershell
   cd backend
   .\start_dev.ps1
   ```

### Solution 2 : Utiliser localhost (si frontend et backend sont sur la même machine)

Si le frontend et le backend sont sur la même machine, utilisez `localhost` :

**Backend :**
```powershell
python manage.py runserver localhost:8000
```

**Frontend :** Modifiez `api.ts` pour utiliser `http://localhost:8000`

### Solution 3 : Vérifier les erreurs du serveur Django

Regardez la console où le serveur Django s'exécute. S'il y a des erreurs, elles s'afficheront là.

## 📋 Checklist de vérification

- [ ] Le serveur Django est démarré
- [ ] Le serveur écoute sur `10.10.107.14:8000` (pas `127.0.0.1`)
- [ ] Le port 8000 n'est pas bloqué par le firewall
- [ ] L'adresse IP `10.10.107.14` est correcte pour votre machine
- [ ] Le frontend pointe vers la bonne URL (`http://10.10.107.14:8000`)
- [ ] Aucune erreur dans la console du serveur Django
- [ ] L'environnement virtuel est activé
- [ ] Les migrations Django sont appliquées

## 🐛 Erreurs courantes

### "Address already in use"

Le port 8000 est déjà utilisé par un autre processus.

**Solution :**
```powershell
# Trouver le processus utilisant le port 8000
netstat -ano | findstr :8000

# Tuer le processus (remplacez PID par le numéro trouvé)
taskkill /PID <PID> /F
```

### "Permission denied"

Vous n'avez pas les permissions pour écouter sur cette adresse IP.

**Solution :** Utilisez `localhost` ou `127.0.0.1` à la place.

### Le serveur démarre mais le frontend ne peut toujours pas se connecter

**Vérifications :**
1. Vérifiez que vous utilisez `http://` et non `https://`
2. Vérifiez que l'URL ne contient pas de slash final : `http://10.10.107.14:8000` (pas `http://10.10.107.14:8000/`)
3. Vérifiez la configuration CORS dans `settings.py`

## 📞 Support supplémentaire

Si le problème persiste :
1. Vérifiez les logs du serveur Django
2. Vérifiez la console du navigateur pour plus de détails
3. Testez avec `curl` ou Postman :
   ```powershell
   curl http://10.10.107.14:8000/api/
   ```

