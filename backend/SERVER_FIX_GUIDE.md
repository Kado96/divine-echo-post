# 🔧 Guide de Correction des Erreurs de Connexion au Serveur

## 🚨 Erreur `ERR_CONNECTION_TIMED_OUT`

Si vous voyez cette erreur dans le frontend :
```
GET http://10.10.107.14:8000/api/settings/current/ net::ERR_CONNECTION_TIMED_OUT
POST http://10.10.107.14:8000/api/login/ net::ERR_CONNECTION_TIMED_OUT
```

Cela signifie que le serveur Django n'est **pas accessible** sur `10.10.107.14:8000`.

## ✅ Solution Automatique

### Option 1 : Script de Correction Automatique (Recommandé)

```powershell
cd backend
.\check_and_fix_server.ps1 --auto
```

Ce script va :
1. ✅ Vérifier si le serveur est démarré
2. ✅ Vérifier si le port 8000 est accessible
3. ✅ Démarrer le serveur automatiquement si nécessaire
4. ✅ Vérifier que les endpoints sont accessibles

### Option 2 : Démarrer le Serveur Manuellement

```powershell
cd backend
.\start_dev.ps1
```

Assurez-vous que le serveur démarre avec le message :
```
Starting development server at http://10.10.107.14:8000/
```

**⚠️ IMPORTANT** : Si vous voyez `http://127.0.0.1:8000/` au lieu de `http://10.10.107.14:8000/`, le serveur n'écoute pas sur la bonne adresse.

## 🔍 Diagnostic Manuel

### 1. Vérifier l'état du serveur

```powershell
cd backend
.\check_server.ps1
```

### 2. Vérifier les processus Django

```powershell
# Vérifier les processus Python
Get-Process python -ErrorAction SilentlyContinue

# Vérifier si le port 8000 est utilisé
Get-NetTCPConnection -LocalPort 8000
```

### 3. Vérifier l'adresse IP

```powershell
# Vérifier votre adresse IP
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "10.10.107.*"}
```

## 🛠️ Solutions aux Problèmes Courants

### Problème 1 : Le serveur n'est pas démarré

**Solution** :
```powershell
cd backend
.\start_dev.ps1
```

### Problème 2 : Le serveur écoute sur 127.0.0.1 au lieu de 10.10.107.14

**Solution** : Arrêter le serveur (Ctrl+C) et le redémarrer avec :
```powershell
cd backend
python manage.py runserver 10.10.107.14:8000
```

Ou utiliser le script :
```powershell
.\start_dev.ps1
```

### Problème 3 : Le port 8000 est déjà utilisé

**Solution** :
1. Trouver le processus qui utilise le port :
   ```powershell
   Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess
   ```

2. Arrêter le processus :
   ```powershell
   Stop-Process -Id <PID>
   ```

3. Redémarrer le serveur :
   ```powershell
   .\start_dev.ps1
   ```

### Problème 4 : Le firewall bloque le port 8000

**Solution** : Créer une règle de firewall :
```powershell
New-NetFirewallRule -DisplayName "Django Dev Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

### Problème 5 : L'adresse IP 10.10.107.14 n'est pas correcte

**Solution** :
1. Vérifier votre adresse IP réelle :
   ```powershell
   ipconfig
   ```

2. Mettre à jour l'adresse dans :
   - `backend/start_dev.ps1` (ligne 40)
   - `backend/shalomministry/settings.py` (ALLOWED_HOSTS)
   - Le frontend (fichier de configuration API)

## 📋 Checklist de Vérification

Avant de signaler un problème, vérifiez :

- [ ] Le serveur Django est démarré (`.\check_server.ps1`)
- [ ] Le serveur écoute sur `10.10.107.14:8000` (pas `127.0.0.1:8000`)
- [ ] Le port 8000 est accessible (`Get-NetTCPConnection -LocalPort 8000`)
- [ ] L'adresse IP `10.10.107.14` est correcte pour votre machine
- [ ] Le firewall n'bloque pas le port 8000
- [ ] Les endpoints répondent (`.\check_and_fix_server.ps1`)

## 🚀 Utilisation du Script de Correction

### Mode Interactif

```powershell
cd backend
.\check_and_fix_server.ps1
```

Le script vous demandera si vous voulez démarrer le serveur automatiquement.

### Mode Automatique

```powershell
cd backend
.\check_and_fix_server.ps1 --auto
```

Le script démarrera automatiquement le serveur si nécessaire.

## 📚 Documentation Complémentaire

- **Troubleshooting général** : `backend/TROUBLESHOOTING.md`
- **Vérification du serveur** : `backend/check_server.ps1`
- **Démarrage du serveur** : `backend/start_dev.ps1`

## ⚠️ Notes Importantes

1. **Le serveur doit écouter sur `10.10.107.14:8000`** et non sur `127.0.0.1:8000` pour que le frontend puisse s'y connecter.

2. **Le firewall Windows** peut bloquer les connexions entrantes. Assurez-vous que le port 8000 est autorisé.

3. **L'adresse IP `10.10.107.14`** doit être l'adresse IP réelle de votre machine sur le réseau local.

4. **Si vous changez d'adresse IP**, mettez à jour :
   - `backend/start_dev.ps1`
   - `backend/shalomministry/settings.py` (ALLOWED_HOSTS)
   - La configuration API du frontend

