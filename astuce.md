⚙️ Administration et Maintenance

- **Accès Admin** : `/admin/login` sur le frontend ou `/admin` sur le backend.
- **Initialisation** : Pour réinitialiser les données de base (noms de sections, langues), lancez :
  ```powershell
  python populate_defaults.py
  ```
- **Images** : Le projet utilise un proxy d'image pour supporter les liens Google Drive sans erreurs de sécurité (CORS).

## 📝 Notes de Sécurité
- Le fichier `db.sqlite3` et les fichiers `.env` sont exclus de Git pour protéger vos données et accès.
- Les accès API sont protégés par des tokens **JWT**.
- En production (Render/Supabase), les fichiers statiques sont servis via **WhiteNoise**.

## 📁 Système de Nommage des Fichiers (Nettoyage)
Pour éviter que les images ne "cassent" lors du transfert de Windows (Local) vers Linux (Production/Render), le projet intègre un système de nettoyage automatique (Slugify) :
- **Nettoyage Universel** : Les accents sont supprimés, les espaces deviennent des tirets (ex: `L'Évêque à Makamba.JPG` ➔ `l-eveque-a-makamba.jpg`).
- **Compatibilité S3** : Ce système est actif aussi bien pour le stockage local que pour **Supabase Storage**.
- **Stabilité des URLs** : Garanti que les liens vers vos documents et images restent valides sur tous les navigateurs.

---

## 🏗️ Architecture Technique : Synchronisation (Modèle Réutilisable)

Ce projet utilise une architecture de synchronisation "One-Way" (Local -> Prod) très efficace pour les petits et moyens projets. Voici comment la reproduire ailleurs.

### 1. L'Interrupteur de Base de Données (`.env`)
Dans le fichier `settings.py`, nous utilisons une condition basée sur une variable d'environnement :
- **`USE_LOCAL_SQLITE=True`** : Django utilise `db.sqlite3`. C'est **obligatoire** en développement pour éviter l'erreur `MaxClientsInSessionMode` de Supabase (limite de connexions atteintes).
- **`DATABASE_URL=...`** (et `USE_LOCAL_SQLITE=False`) : Utilisé uniquement par le serveur en production ou par le script de synchronisation.

**Pourquoi cette approche ?**
Les offres gratuites/standard de Supabase limitent le nombre de clients connectés simultanément. En travaillant sur **SQLite** localement, vous ne consommez aucune de ces connexions précieuses, vous travaillez plus vite (pas de latence réseau), et vous ne risquez pas de casser les données en ligne par erreur.

### 2. Le Script `sync_local_to_prod.py`
Ce script est le "cerveau" de l'opération. Il gère la synchronisation de la manière suivante :
- **Identification par "Sens" (Clé Naturelle)** : Au lieu de se fier uniquement aux numéros d'IDs (qui peuvent être différents entre votre PC et Supabase), le script cherche les objets par leur nom (Paroisse), titre (Sermon) ou nom d'utilisateur.
- **Mappage Dynamique des IDs (Mémoire)** : Si l'ID d'un utilisateur est différent sur Supabase (ex: 12 au lieu de 75), le script mémorise ce changement (`75 -> 12`) et traduit automatiquement toutes les relations (clés étrangères) même s'il s'agit de colonnes techniques (ex: `user_id`).
- **Fiabilité Maximale** : Chaque élément est traité dans sa propre transaction. Une erreur sur un utilisateur ou un sermon spécifique n'arrêtera jamais la synchronisation des 50 autres éléments.
- **Mise à jour Intelligente** : S'il trouve un objet identique, il le met à jour (`update`). Sinon, il le crée (`create`).
1.  **Double Connexion** : Il ouvre deux connexions simultanées :
    *   `default` : La base SQLite locale (Source).
    *   `prod` : La base Supabase distante (Destination).
2.  **Composants Synchronisés** :
    *   👤 **Sécurité** : Utilisateurs et Profils (Comptes).
    *   ⚙️ **Configuration** : Paramètres du site (Textes, Logos, Couleurs).
    *   ⛪ **Église** : Paroisses, Ministères et leurs activités.
    *   📖 **Enseignement** : Sermons et leurs catégories.
    *   📰 **Communication** : Annonces, Articles et Témoignages.
    *   📄 **Contenu Web** : Timeline, Valeurs, Vision, Équipe et Présentation du Diocèse.
3.  **Vérification d'Existence** : Pour chaque élément :
    *   Il regarde si l'**ID** existe déjà en production.
    *   **Si OUI** ➔ Il met à jour l'élément (`UPDATE`).
    *   **Si NON** ➔ Il crée l'élément avec le même ID (`CREATE`).
4.  **Ordre des Dépendances** : Le script traite d'abord les tables "parents" (ex: Catégories) avant les tables "enfants" (ex: Sermons) pour éviter les erreurs de clés étrangères.

### 3. Gestion de la Pagination (DRF) dans le Frontend
En local (SQLite), l'API renvoie souvent une liste directe `[...]`. En production (Supabase/PostgreSQL), si la pagination est activée, l'API renvoie un objet `{ "results": [...] }`.

- **Erreur Classique** : `data.map is not a function` ou `data.filter is not a function`.
  *⚠️ Cas critique en production (Vite/Rollup) : Si cette erreur survient dans un build compilé, elle prendra souvent la forme `TypeError: _.map is not a function` ou `e.map is not a function`. Le minificateur réduit le nom de votre variable (ex: `categories`) en `_` ou `e`. Si l'API retourne un objet paginé au lieu d'un tableau et que votre code n'est pas sécurisé, le rendu `.map()` fait irrémédiablement crasher l'UI de la page.*
- **L'astuce Architecturale (Le Filtre d'entrée)** : Pour éviter de devoir écrire le code de sécurité sur chaque nouvelle page, la "Rule of Thumb" de ce projet a été d'appliquer la *Safe Array Extraction* directement au sein du connecteur (dans le fichier central `src/lib/api.ts`) pour que chaque appel devienne **100% robuste de base** :

```typescript
// Au sein de toutes les fonctions fetch (fetchSermons, fetchActualites, etc.)
export async function fetchData(lang?: string): Promise<Item[] | null> {
    const data = await apiFetch<PaginatedResponse<Item>>(`/api/items/?language=${lang}`);
    
    // 🔥 L'arme secrète Globale: Si c'est un tableau normal, renvoie-le.
    // Si c'est un format paginé, renvoie .results. 
    // Sinon annule (null).
    return (Array.isArray(data) ? (data as any) : data?.results) ?? null;
}
```
Avec ce simple patch dans l'API, tu assures l'immunité absolue de tout ton frontend web contre les bugs silencieux d'arrays.

### 4. Le Piège Fatal de l'Erreur "405 Method Not Allowed"
Ce projet nécessite deux hébergements distincts :
- Le Backend (Python/Django) sur **Render / Heroku**.
- Le Frontend (App React construite) sur un hébergement mutualisé standard comme **InfinityFree / Wuaze**.

**Symptôme :** Tu saisis de nouvelles informations dans une page *"Admin"*, tu cliques sur Sauvegarder, et rien ne se passe. Dans la console tu vois l'erreur rouge ou jaune : `Failed to load resource: the server responded with a status of 405 (Method Not Allowed)`.

**Le problème (`.env.production`) :**
Tu as accidentellement défini l'URL de base de ton API sur l'URL de ton site web (React) au lieu du vrai backend (Python). Par exemple :
```env
# FAUX (Provoquera l'erreur 405)
VITE_API_URL=https://monsiteReact.wuaze.com
```
L'hébergeur "wuaze" tourne sous Apache pour servir tes fichiers statiques. Quand le Front React lui envoie un `PATCH` ou `POST` pour enregistrer en SQL, Apache panique, car un serveur Web de fichiers ne sait gérer que des requêtes de type `GET`. Il répond IMMÉDIATEMENT = `405 Method Not Allowed`.

```env
# VRAI (La bonne manière)
VITE_API_URL=https://monserveur-django-base.onrender.com 
```
**Conclusion :** Assure-toi que toutes les requêtes en modifications aillent pointer concrètement vers le cerveau Python.

### 5. Accessibilité et Autofill (Formulaires)
Pour que les navigateurs (Chrome, Safari, etc.) puissent remplir automatiquement les mots de passe et les emails, et pour garantir une bonne accessibilité (Lighthouse) :
- **ID Unique** : Chaque `Input` doit avoir un `id` correspondant au `htmlFor` de son `Label`.
- **Attribut Name** : Indispensable pour que le navigateur comprenne ce que contient le champ (ex: `name="email"`).
- **Auto-complete** : Toujours spécifier le type (ex: `autoComplete="current-password"` ou `"username"`).

**Exemple de structure parfaite :**
```tsx
<Label htmlFor="user-email">Email</Label>
<Input 
  id="user-email" 
  name="email" 
  type="email" 
  autoComplete="email" 
/>
```

### 7. Pourquoi c'est mieux que `dumpdata` ?
- **Pas d'écrasement total** : Contrairement à `loaddata`, le script local `sync_local_to_prod` ne supprime rien en production. Il fusionne les données de manière bidirectionnelle avec des clés naturelles.
- **Sécurité** : Si une erreur survient au milieu, la transaction `transaction.atomic` annule tout pour éviter une base de données corrompue.
- **Liberté** : Vous pouvez modifier un texte en local et l'envoyer en production en 2 secondes sans toucher au code ni ouvrir PgAdmin.

## ⚠️ Mise en garde cruciale pour la Production (Render)

### 1. Le Piège du Disque Éphémère
Si vous hébergez votre site sur **Render** (version gratuite ou standard sans disque persistant) :
- **Tout ce que vous uploadez via l'admin** (Logo, Photos, etc.) sera **EFFACÉ** à chaque redémarrage du serveur (toutes les 24h environ).
- **Solution de secours :** Utilisez des liens directs vers des images hébergées ailleurs (Google Drive, ImgBB, etc.).
- **Solution Pro :** Configurez **Supabase Storage** (voir section ci-dessous).

### 2. Le Cas des Vidéos 🎥
**NE JAMAIS héberger vos vidéos directement sur Render ou Supabase Storage.**
- Les fichiers vidéos sont trop lourds et ralentiront votre site.
- **Meilleure Pratique :** Hébergez vos vidéos sur **YouTube** (ou Vimeo) en mode "Non répertorié" et mettez le lien dans l'administration. C'est gratuit et ultra rapide.

---

## 🎨 Refonte Éditoriale : Page Diocèse (Style Magazine)

En mars 2026, la page **Diocèse** a été transformée pour adopter un style "Éditorial/Magazine" haut de gamme. Voici les règles de cette architecture pour éviter toute régression :

### 1. Structure Tri-partite (Vision, Mission, Valeurs)
Au lieu d'un seul bloc de texte, le contenu est désormais divisé en **3 blocs indépendants** dans le modèle `DiocesePresentation`.
- **Modèle** : Chaque bloc possède son titre, sa description (multilingue) et **sa propre image d'illustration** (`vision_image`, `mission_image`, `values_image`).
- **Serializer** : Tous les nouveaux champs (ex: `mission_title_fr`, `mission_image_display`) doivent être explicitement déclarés dans `serializers.py` pour être visibles sur le site.

### 2. Logique d'Affichage UI (Frontend)
Le design repose sur une **alternance visuelle** codée dans `Diocese.tsx` :
- **Bloc 1 (Vision)** : Image à Droite. Barre d'accentuation **Rouge**.
- **Bloc 2 (Mission)** : Image à Gauche. Barre d'accentuation **Violette**.
- **Bloc 3 (Valeurs)** : Image à Droite. Barre d'accentuation **Émeraude**.
- **Effet Premium** : Les images utilisent un filtre `grayscale` par défaut qui repasse en couleurs au survol (`hover:grayscale-0`).

### 3. Gestion des Textes Longs
- **Problème** : Le HTML ignore normalement les sauts de ligne tapés dans un formulaire.
- **Solution** : On utilise la classe CSS `whitespace-pre-line` dans les composants React.
- **Règle d'or** : Ne jamais supprimer `whitespace-pre-line` sur les champs de description, sinon les points (✓) et les paragraphes saisis dans l'admin redeviendront un seul bloc illisible.

### 4. Administration (VisionIntroManager)
- Le gestionnaire admin regroupe maintenant les 3 sections.
- Chaque section utilise `ImageFieldWithPreview`.
- **Maintenance** : Si vous retirez un bloc ou changez un ID dans le code, assurez-vous de mettre à jour le mapping dans `SectionConfig` du fichier `VisionIntroManager.tsx`.

### 5. Suppression des Sections Obsolètes
- Les anciennes sections **"Nos Axes Stratégiques"** et la **"Grille de Valeurs"** (sous forme de petites cartes) ont été supprimées du frontend pour ne pas alourdir la page.
### 6. Administration 100% Dynamique (Mars 2026)
La page **Diocèse** a atteint une maturité de gestion totale. Absolument aucun texte visible ne doit être écrit "en dur" dans `Diocese.tsx`.
- **Hero & Navigation** : Le grand titre ("The Diocese"), le sous-titre de bienvenue et même les labels du menu collant (Historique, Évêque, etc.) sont gérés dans l'administration.
- **Badges Thématiques** : Les petits labels en majuscules (ex: "IDÉALISME", "STRATÉGIE") sont désormais des champs éditables pour chaque bloc.
- **Titres Officiels** : La fonction de l'évêque (ex: "Évêque du Diocèse") est traduisible pour s'adapter parfaitement à l'anglais ("Bishop of the Diocese").
- **Règle de Secours (Fallback)** : Dans le code frontend, on utilise toujours `presentation?.[`field_${safeLang}`] || t('default_key', 'Texte de secours')`. Cela garantit que si une traduction est vide dans l'admin, le site affiche une valeur par défaut cohérente.

### 7. Footer & Signature
- **Copyright Fixe** : Le pied de page a été simplifié pour afficher uniquement : `© 2026 Diocèse Makamba. Tous droits réservés.`
- **Design Minimaliste** : Tous les liens de navigation secondaire (Confidentialité, Support) ont été supprimés pour épurer l'interface.

---

## 📰 Système d'Actualités (Bilingue Native & Galeries)

Depuis Mars 2026, le système de communication a été refondu pour être **nativement bilingue** et supporter des **galeries photos riches**.

### 1. Architecture "Single-Record"
Contrairement à d'autres sections, un article n'est plus créé deux fois (un FR, un EN). 
- **Modèle `Announcement`** : Contient désormais des champs `title_fr`, `title_en`, `content_fr`, `content_en` au sein de la même ligne en base de données.
- **Avantage** : Une seule image de couverture et une seule galerie photo sont liées aux deux versions linguistiques. Cela garantit la cohérence visuelle.

### 2. Serializer Intelligent
Le backend utilise un `SerializerMethodField` pour les champs `title` et `content`.
- **Fonctionnement** : Il détecte la langue demandée dans l'URL (ex: `?language=en`) et renvoie automatiquement la bonne version.
- **Langues supportées** : Français (FR), Anglais (EN) (Simplification Mars 2026).
- **Sécurité** : Si la version anglaise est vide, il peut renvoyer la version française par défaut pour éviter un écran vide.

### 3. Gestion de la Galerie (Multi-upload)
L'administration des actualités permet désormais d'ajouter plusieurs photos à la fois.
- **Backend** : Le ViewSet intercepte `gallery_images` (liste de fichiers) et crée automatiquement les entrées dans la table `AnnouncementImage`.
- **Nettoyage** : Vous pouvez supprimer une image spécifique de la galerie sans toucher à l'article principal ni aux autres photos.

### 4. Migration de données
Si vous devez déplacer des données, utilisez toujours le script `migrate_announcements.py` (ou le synchroniseur global) qui sait transformer l'ancien format (articles séparés par langue) vers le nouveau format bilingue intégré.

---

## 🗄️ Configuration Supabase Storage (S3) : La Méthode Standard et Robuste

### Le Problème
Le script de synchronisation (Sync) crée un **sous-dossier `media/`** dans le bucket `media`. Pour que les nouveaux fichiers envoyés par l'Administration aillent au même endroit, il faut une configuration précise.

**Structure Réelle :**
`https://[project].supabase.co/storage/v1/object/public/media/media/[dossier]/[fichier.jpg]`
1. Premier `media` = Nom du Bucket.
2. Deuxième `media` = Sous-dossier (pour l'organisation).

### La Solution (Configuration Définitive)

**1. `api/utils/storage.py`** — Utiliser `location` :
```python
class CleanS3Boto3Storage(S3Boto3Storage):
    # CRITIQUE: Force l'écriture dans le sous-dossier 'media/'
    location = 'media'
```

**2. `settings.py`** — Domaine propre :
```python
# On pointe l'URL de base vers le BUCKET seulement :
AWS_S3_CUSTOM_DOMAIN = f"{PROJECT_ID}.supabase.co/storage/v1/object/public/{AWS_STORAGE_BUCKET_NAME}"
MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/"

# Résultat auto-généré par Django: 
# DOMAIN (public/media) + LOCATION (media) + PATH (settings/logo.png)
# = .../public/media/media/settings/logo.png ✅
```

### Pourquoi c'est la meilleure méthode ?
Django-storages construit l'URL en faisant `DOMAINE + LOCATION + NOM`. En mettant le sous-dossier dans **`location`**, vous permettez à Django de savoir exactement où ranger les nouveaux fichiers, tout en garantissant que les anciens (du Sync) restent accessibles au même endroit.

---


