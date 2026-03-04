# 📝 Changelog - Synchronisation Local → Production

## 🎯 Objectif

Mise en place d'une architecture de synchronisation manuelle où :
- Le développement se fait en local avec SQLite
- La production utilise Supabase (PostgreSQL)
- Le frontend ne change jamais
- Le backend expose les mêmes routes API
- La synchronisation des données se fait manuellement via un script

## ✅ Modifications apportées

### 1. Fichiers créés

#### `backend/sync_local_to_prod.py`
Script principal de synchronisation avec les fonctionnalités suivantes :
- ✅ Lecture depuis SQLite (base locale)
- ✅ Écriture vers PostgreSQL/Supabase (base production)
- ✅ Gestion des transactions pour la sécurité
- ✅ Mode dry-run (simulation)
- ✅ Mode confirmation explicite
- ✅ Logs détaillés (console + fichier)
- ✅ Statistiques de synchronisation
- ✅ Gestion des relations dans le bon ordre
- ✅ Respect des IDs existants
- ✅ Exclusion des fichiers binaires (seulement URLs)

#### `backend/sync_local_to_prod.ps1`
Script PowerShell pour Windows qui :
- Active automatiquement l'environnement virtuel
- Vérifie la présence de `DATABASE_URL`
- Exécute le script Python avec les bons paramètres
- Gère les codes de sortie et les erreurs

#### `backend/sync_local_to_prod.bat`
Script Batch pour Windows (CMD) qui :
- Active automatiquement l'environnement virtuel
- Vérifie la présence de `DATABASE_URL`
- Exécute le script Python avec les bons paramètres
- Gère les codes de sortie et les erreurs

#### `backend/SYNC_README.md`
Documentation complète du script de synchronisation :
- Guide d'utilisation (PowerShell, Batch, Bash)
- Exemples pratiques
- Dépannage
- Workflow recommandé

#### `backend/CHANGELOG_SYNC.md`
Ce fichier - récapitulatif des modifications

### 2. Fichiers modifiés

**Aucun fichier existant n'a été modifié** ✅

Le projet reste 100% compatible avec le comportement existant.

### 3. Configuration existante vérifiée

#### `backend/shalomministry/settings.py`
✅ **Déjà compatible** avec SQLite et PostgreSQL :
- Utilise `DATABASE_URL` si défini (PostgreSQL/Supabase)
- Utilise SQLite par défaut si `DATABASE_URL` n'est pas défini
- Configuration automatique via `dj_database_url`

#### Routes API
✅ **Aucune modification** - Toutes les routes existantes fonctionnent normalement

#### Frontend
✅ **Aucune modification** - Le frontend continue d'utiliser les mêmes endpoints

## 🔧 Architecture technique

### Connexions aux bases de données

Le script utilise deux connexions Django distinctes :

1. **Base 'default'** : SQLite (local)
   - Configuration automatique via `settings.py`
   - Utilisée pour **lire** les données

2. **Base 'prod'** : PostgreSQL (Supabase)
   - Configuration dynamique depuis `DATABASE_URL`
   - Utilisée pour **écrire** les données

### Ordre de synchronisation

Les modèles sont synchronisés dans l'ordre suivant pour respecter les dépendances :

1. User (Django built-in)
2. Account
3. CourseCategory, SermonCategory, Category
4. SubCategory
5. BasicProduct
6. Course, Sermon, Shop
7. Lesson, Product, ControlFrequency
8. Enrollment, PublicProduct
9. LessonProgress, SalePriceHistory, Supply, Sales
10. Favorite
11. History
12. SiteSettings

### Gestion des fichiers

Les champs `FileField` et `ImageField` sont **exclus** de la synchronisation :
- Les fichiers binaires ne sont pas copiés
- Seules les URLs correspondantes sont synchronisées si elles existent
- Exemple : `Course.image` (ImageField) → Non synchronisé, `Course.image_url` → Synchronisé

## 📊 Modèles synchronisés

### api.accounts
- ✅ User (Django built-in)
- ✅ Account

### api.courses
- ✅ CourseCategory
- ✅ Course
- ✅ Lesson
- ✅ Enrollment
- ✅ LessonProgress
- ✅ Favorite

### api.sermons
- ✅ SermonCategory
- ✅ Sermon

### api.settings
- ✅ SiteSettings (singleton)

### api.shops
- ✅ Shop
- ✅ ControlFrequency
- ✅ Category
- ✅ SubCategory
- ✅ BasicProduct
- ✅ Product
- ✅ SalePriceHistory
- ✅ Supply
- ✅ Sales
- ✅ History
- ✅ PublicProduct

## 🔒 Sécurité

### Mesures de sécurité implémentées

1. **Transactions** : Toute la synchronisation se fait dans une transaction
2. **Pas de suppression** : Aucune donnée n'est supprimée en production
3. **Mode dry-run** : Permet de tester sans modifier
4. **Confirmation explicite** : Option `--confirm` pour confirmation
5. **Logs détaillés** : Traçabilité complète des opérations
6. **Gestion d'erreurs** : Rollback automatique en cas d'erreur

## 📋 Utilisation

### Prérequis

1. Base SQLite locale avec des données
2. Variable d'environnement `DATABASE_URL` définie
3. Migrations appliquées sur les deux bases

### Commandes

#### Windows (PowerShell - Recommandé)
```powershell
# Mode simulation
.\sync_local_to_prod.ps1 -DryRun

# Synchronisation avec confirmation
.\sync_local_to_prod.ps1 -Confirm

# Synchronisation directe
.\sync_local_to_prod.ps1
```

#### Windows (CMD/Batch)
```cmd
sync_local_to_prod.bat --dry-run
sync_local_to_prod.bat --confirm
sync_local_to_prod.bat
```

#### Linux/Mac (Bash)
```bash
# Activer l'environnement virtuel d'abord
source venv/bin/activate

# Mode simulation
python sync_local_to_prod.py --dry-run

# Synchronisation avec confirmation
python sync_local_to_prod.py --confirm

# Synchronisation directe
python sync_local_to_prod.py
```

## 🧪 Tests recommandés

1. **Test en mode dry-run** : Vérifier que le script fonctionne sans erreur
2. **Vérification des logs** : Examiner les statistiques et les erreurs éventuelles
3. **Test sur un environnement de staging** : Si disponible
4. **Vérification post-sync** : Tester l'API en production après synchronisation

## ⚠️ Points d'attention

1. **Fichiers binaires** : Les fichiers uploadés ne sont pas synchronisés
2. **IDs** : Les IDs sont préservés, attention aux conflits
3. **Relations** : Les ForeignKeys doivent pointer vers des objets existants
4. **Migrations** : Les deux bases doivent avoir les mêmes migrations

## 🔄 Workflow recommandé

1. Développement local avec SQLite
2. Test en local
3. Mode simulation : `python sync_local_to_prod.py --dry-run`
4. Vérification des logs
5. Synchronisation : `python sync_local_to_prod.py --confirm`
6. Vérification en production

## 📞 Support

En cas de problème :
1. Consulter `sync_log.txt`
2. Vérifier les migrations
3. Vérifier la connexion Supabase
4. Utiliser le mode `--dry-run` pour diagnostiquer

## ✨ Résultat

✅ **Aucun changement visible côté frontend**
✅ **Backend compatible local / prod**
✅ **Script de sync clair, documenté et sûr**
✅ **Aucun fichier existant modifié**
✅ **Comportement existant préservé**

