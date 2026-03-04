# 🔄 Guide de Synchronisation Local → Production

## 📋 Vue d'ensemble

Ce script permet de synchroniser manuellement les données du développement local (SQLite) vers la production (Supabase/PostgreSQL) sans modifier le comportement existant du projet.

## ⚠️ Contraintes importantes

- ❌ **Ne supprime JAMAIS** de données en production
- ❌ **Ne synchronise PAS** les fichiers binaires (seulement les URLs)
- ✅ **Respecte les IDs** existants
- ✅ **Utilise des transactions** pour la sécurité
- ✅ **Gère les relations** dans le bon ordre

## 🚀 Prérequis

1. **Base de données locale (SQLite)** : Doit être présente dans `backend/db.sqlite3`
2. **Environnement virtuel Python** : Doit être créé et activé
   ```powershell
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
   ```bash
   # Linux/Mac
   python -m venv venv
   source venv/bin/activate
   ```
3. **Variable d'environnement DATABASE_URL** : Doit être définie avec l'URL Supabase
   
   ⚠️ **IMPORTANT** : Vous devez utiliser votre **vraie URL Supabase**, pas un placeholder !
   
   **Comment obtenir votre URL Supabase :**
   1. Allez sur [https://app.supabase.com](https://app.supabase.com)
   2. Sélectionnez votre projet
   3. Allez dans **Settings** > **Database**
   4. Dans la section **Connection string**, sélectionnez **URI**
   5. Copiez la chaîne de connexion
   6. Remplacez `[YOUR-PASSWORD]` par votre mot de passe de base de données
   
   **Exemple de définition :**
   ```powershell
   # Windows PowerShell
   $env:DATABASE_URL = "postgresql://postgres.eiokoxdmgxxyexmqfsua:VOTRE_MOT_DE_PASSE@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
   ```
   ```bash
   # Linux/Mac
   export DATABASE_URL="postgresql://postgres.eiokoxdmgxxyexmqfsua:VOTRE_MOT_DE_PASSE@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
   ```
   
   ⚠️ **Note** : Remplacez `VOTRE_MOT_DE_PASSE` par votre mot de passe réel. Si votre mot de passe contient des caractères spéciaux, encodez-les en URL (ex: `@` devient `%40`)
   
4. **Migrations appliquées** : Les deux bases doivent avoir les mêmes migrations

## 📖 Utilisation

### 🪟 Windows (PowerShell - Recommandé)

#### Mode simulation (recommandé en premier)

```powershell
cd backend
.\sync_local_to_prod.ps1 -DryRun
```

Ce mode affiche ce qui serait synchronisé **sans modifier** la base de production.

#### Synchronisation avec confirmation

```powershell
.\sync_local_to_prod.ps1 -Confirm
```

Le script demandera confirmation avant de procéder.

#### Synchronisation directe

```powershell
.\sync_local_to_prod.ps1
```

⚠️ **Attention** : Cette commande synchronise immédiatement sans confirmation.

#### Combinaison des options

```powershell
.\sync_local_to_prod.ps1 -DryRun -Confirm
```

### 🪟 Windows (CMD/Batch)

```cmd
cd backend
sync_local_to_prod.bat --dry-run
sync_local_to_prod.bat --confirm
sync_local_to_prod.bat
```

### 🐧 Linux/Mac (Bash)

#### Mode simulation (recommandé en premier)

```bash
cd backend
source venv/bin/activate  # Activer l'environnement virtuel
python sync_local_to_prod.py --dry-run
```

#### Synchronisation avec confirmation

```bash
python sync_local_to_prod.py --confirm
```

#### Synchronisation directe

```bash
python sync_local_to_prod.py
```

⚠️ **Attention** : Cette commande synchronise immédiatement sans confirmation.

## 📊 Ordre de synchronisation

Le script synchronise les modèles dans l'ordre suivant (pour respecter les dépendances) :

1. **User** (Django built-in)
2. **Account** (dépend de User)
3. **CourseCategory, SermonCategory, Category** (catégories indépendantes)
4. **SubCategory** (dépend de Category)
5. **BasicProduct** (dépend de SubCategory)
6. **Course, Sermon, Shop** (dépendent des catégories et Account)
7. **Lesson, Product, ControlFrequency** (dépendent de Course/Shop)
8. **Enrollment, PublicProduct** (dépendent de Course/User/Category)
9. **LessonProgress, SalePriceHistory, Supply, Sales** (dépendent de Enrollment/Product)
10. **Favorite** (dépend de User)
11. **History** (indépendant)
12. **SiteSettings** (singleton, pk=1)

## 🔍 Gestion des fichiers

Le script **ne synchronise PAS** les fichiers binaires (FileField, ImageField). Seules les URLs correspondantes sont synchronisées si elles existent.

**Exemple** :
- `Course.image` (ImageField) → **Non synchronisé**
- `Course.image_url` (URLField) → **Synchronisé**

## 📝 Logs

Le script génère deux types de logs :

1. **Console** : Affichage en temps réel
2. **Fichier** : `sync_log.txt` dans le répertoire `backend/`

## ✅ Statistiques

À la fin de la synchronisation, le script affiche :

- ✅ **Créés** : Nombre d'éléments créés en production
- 🔄 **Mis à jour** : Nombre d'éléments mis à jour
- ⏭️ **Ignorés** : Éléments déjà à jour
- ❌ **Erreurs** : Nombre d'erreurs rencontrées

## 🔒 Sécurité

- **Transactions** : Toute la synchronisation se fait dans une transaction
- **Pas de suppression** : Aucune donnée n'est supprimée en production
- **Mode dry-run** : Toujours tester en mode simulation d'abord
- **Confirmation** : Utiliser `--confirm` pour une confirmation explicite

## 🐛 Dépannage

### Erreur : "DATABASE_URL n'est pas défini"

**Solution** : Définir la variable d'environnement :
```powershell
# PowerShell
$env:DATABASE_URL = "postgresql://postgres.eiokoxdmgxxyexmqfsua:VOTRE_MOT_DE_PASSE@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
```
```bash
# Bash
export DATABASE_URL="postgresql://postgres.eiokoxdmgxxyexmqfsua:VOTRE_MOT_DE_PASSE@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

### Erreur : "could not translate host name" ou "Name or service not known"

**Cause** : L'URL DATABASE_URL contient un placeholder ou est incorrecte.

**Solution** :
1. Vérifiez que vous utilisez la bonne URL : `postgresql://postgres.eiokoxdmgxxyexmqfsua:VOTRE_MOT_DE_PASSE@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require`
2. Remplacez `VOTRE_MOT_DE_PASSE` par votre mot de passe réel
3. Si votre mot de passe contient des caractères spéciaux, encodez-les en URL (ex: `@` devient `%40`)
4. Redéfinissez la variable d'environnement avec la bonne URL

### Erreur : "password authentication failed"

**Cause** : L'authentification échoue, généralement à cause d'un nom d'utilisateur ou mot de passe incorrect.

**Solutions** :
1. **Vérifiez le nom d'utilisateur** : Pour Supabase pooler, il doit être `postgres.eiokoxdmgxxyexmqfsua` (pas juste `postgres`)
2. **Vérifiez le mot de passe** : 
   - Il doit être correctement encodé en URL (ex: `@` devient `%40`)
   - Vérifiez que c'est le bon mot de passe depuis le dashboard Supabase
3. **Vérifiez le format de l'URL** : 
   ```
   postgresql://postgres.eiokoxdmgxxyexmqfsua:VOTRE_MOT_DE_PASSE@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
   ```
4. **Obtenez la bonne URL** depuis le dashboard Supabase :
   - Allez sur https://app.supabase.com
   - Settings > Database > Connection string > URI
   - Copiez l'URL complète et remplacez `[YOUR-PASSWORD]` par votre mot de passe réel
5. **Vérifiez la variable d'environnement** :
   ```powershell
   # PowerShell - Vérifier la valeur
   $env:DATABASE_URL
   ```

### Erreur : "timeout expired" ou "timeout"

**Cause** : La connexion au serveur Supabase expire avant de pouvoir s'établir.

**Solutions** :
1. **Vérifiez votre connexion internet** : Assurez-vous d'avoir une connexion stable
2. **Vérifiez le firewall/antivirus** : Le port 5432 peut être bloqué
3. **Utilisez l'URL directe (sans pooler)** :
   - Allez sur https://app.supabase.com
   - Settings > Database > Connection string
   - Sélectionnez "Direct connection" au lieu de "Connection pooling"
   - Utilisez cette URL dans `DATABASE_URL`
4. **Vérifiez que le projet Supabase est actif** : Les projets inactifs peuvent avoir des timeouts
5. **Attendez quelques minutes** : Le serveur peut être temporairement surchargé
6. **Testez la connexion** :
   ```powershell
   # PowerShell - Tester la connexion
   Test-NetConnection -ComputerName aws-1-eu-central-1.pooler.supabase.com -Port 5432
   ```

### Erreur : "Connexion à la base de production échouée"

**Solutions** :
1. Vérifier que l'URL Supabase est correcte (pas de placeholder)
2. Vérifier que le serveur Supabase est accessible (connexion internet)
3. Vérifier les credentials (utilisateur/mot de passe)
4. Vérifier que le projet Supabase est actif

### Erreur : "Foreign key constraint failed"

**Solution** : Les dépendances ne sont pas respectées. Vérifier que :
1. Les migrations sont à jour sur les deux bases
2. Les IDs des objets parents existent en production

## 📚 Exemples

### Exemple complet (PowerShell)

```powershell
# 1. Tester en mode simulation
.\sync_local_to_prod.ps1 -DryRun

# 2. Si tout est OK, synchroniser avec confirmation
.\sync_local_to_prod.ps1 -Confirm
```

### Exemple complet (Bash)

```bash
# 1. Activer l'environnement virtuel
source venv/bin/activate

# 2. Tester en mode simulation
python sync_local_to_prod.py --dry-run

# 3. Si tout est OK, synchroniser avec confirmation
python sync_local_to_prod.py --confirm
```

### Exemple avec logs détaillés

```powershell
# PowerShell
.\sync_local_to_prod.ps1 -DryRun | Tee-Object -FilePath sync_output.log
```

```bash
# Bash
python sync_local_to_prod.py --dry-run 2>&1 | tee sync_output.log
```

## 🔄 Workflow recommandé

1. **Développement local** : Travailler avec SQLite
2. **Test en local** : Vérifier que tout fonctionne
3. **Mode simulation** : `python sync_local_to_prod.py --dry-run`
4. **Vérification** : Examiner les logs et statistiques
5. **Synchronisation** : `python sync_local_to_prod.py --confirm`
6. **Vérification production** : Tester l'API en production

## 📞 Support

En cas de problème :
1. Vérifier les logs dans `sync_log.txt`
2. Vérifier que les migrations sont à jour
3. Vérifier la connexion à Supabase
4. Utiliser le mode `--dry-run` pour diagnostiquer

## 🔑 Configuration DATABASE_URL

Pour définir la variable d'environnement DATABASE_URL avec votre URL Supabase :

**PowerShell (Windows) :**
```powershell
$env:DATABASE_URL = "postgresql://postgres.eiokoxdmgxxyexmqfsua:Shalom%40123456789@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

**Bash (Linux/Mac) :**
```bash
export DATABASE_URL="postgresql://postgres.eiokoxdmgxxyexmqfsua:Shalom%40123456789@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

⚠️ **Note importante** : 
- Le mot de passe dans l'URL doit être encodé en URL. Le caractère `@` devient `%40`.
- Cette variable d'environnement doit être définie avant d'exécuter le script de synchronisation.
- Pour rendre la variable permanente (PowerShell), ajoutez-la à votre profil : `[Environment]::SetEnvironmentVariable("DATABASE_URL", "votre_url", "User")`

💡 **En cas de timeout** : Si vous rencontrez des erreurs de timeout avec le pooler (`pooler.supabase.com`), essayez d'utiliser l'URL de connexion directe depuis le dashboard Supabase (Settings > Database > Connection string > Direct connection).
