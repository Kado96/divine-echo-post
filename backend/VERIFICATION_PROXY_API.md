# ✅ Vérification - Configuration Proxy API

## 🎯 Objectif

Vérifier que **tous les appels API** (frontend et administration) utilisent `http://localhost:8080/api/` via le proxy Vite, qui redirige automatiquement vers le backend Django sur `localhost:8000`.

## ✅ Configuration Vérifiée

### 1. Proxy Vite (`frontend/vite.config.ts`)

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    secure: false,
  },
}
```

✅ **Le proxy est correctement configuré** pour rediriger toutes les requêtes `/api/*` vers `http://localhost:8000/api/*`.

### 2. API_BASE_URL (`frontend/src/lib/api.ts`)

```typescript
const getApiBaseUrl = (): string => {
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
  
  if (isProduction) {
    // Production: utilise VITE_API_URL ou URL par défaut
    return envUrl || "https://shalom-ministry-backend.onrender.com";
  }
  
  // DÉVELOPPEMENT: retourne "" (chaîne vide) pour utiliser le proxy Vite
  return "";
};
```

✅ **En développement, `API_BASE_URL` est vide**, ce qui signifie que tous les appels utilisent des chemins relatifs `/api/...` qui passent par le proxy Vite.

### 3. Fonctions API (`frontend/src/lib/api.ts`)

Toutes les fonctions utilisent `API_BASE_URL` :

```typescript
const res = await fetch(`${API_BASE_URL}${path}`, { ... });
```

✅ **Tous les appels utilisent des chemins relatifs** en développement :
- `apiGet('/api/courses/admin/courses/')` → `fetch('/api/courses/admin/courses/')` → Proxy Vite → `http://localhost:8000/api/courses/admin/courses/`
- `apiPost('/api/admin/sermons/sermons/')` → `fetch('/api/admin/sermons/sermons/')` → Proxy Vite → `http://localhost:8000/api/admin/sermons/sermons/`

### 4. Pages Administration

#### ✅ Toutes les pages admin utilisent les fonctions API standard :

- **`frontend/src/pages/admin/Courses.tsx`** : Utilise `getAdminEmissions()`, `deleteEmission()` depuis `@/services/admin`
- **`frontend/src/pages/admin/CourseForm.tsx`** : Utilise `apiGet()`, `createEmission()`, `updateEmission()`
- **`frontend/src/pages/admin/Sermons.tsx`** : Utilise `apiGet()`, `apiDelete()`
- **`frontend/src/pages/admin/SermonForm.tsx`** : Utilise `apiGet()`, `apiPost()`, `apiPut()`
- **`frontend/src/pages/admin/Shops.tsx`** : Utilise `apiGet()`, `apiDelete()`
- **`frontend/src/pages/admin/ShopForm.tsx`** : Utilise `apiGet()`, `apiPost()`, `apiPut()`
- **`frontend/src/pages/admin/Settings.tsx`** : Utilise `apiGet()`, `apiPatch()`, `apiPut()`

✅ **Aucun appel direct avec `fetch()` ou `axios`** - Tout passe par les fonctions `apiGet`, `apiPost`, etc.

### 5. Services (`frontend/src/services/`)

#### ✅ Tous les services utilisent les fonctions API standard :

- **`admin.ts`** : Utilise `apiGet`, `apiPost`, `apiPut`, `apiDelete` avec chemins relatifs `/api/...`
- **`auth.ts`** : Utilise `apiPost` pour login/register
- **`emissions.ts`** : Utilise `apiGet` avec chemins relatifs
- **`sermons.ts`** : Utilise `apiGet` avec chemins relatifs

✅ **Tous les services utilisent des chemins relatifs** qui passent par le proxy.

### 6. URLs d'Images (`frontend/src/lib/utils.ts`)

```typescript
export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace(/^http:\/\/localhost:8000/, API_BASE_URL);
  }
  
  // URL relative: ajouter API_BASE_URL (vide en dev, donc utilise le proxy)
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}
```

✅ **Les URLs d'images utilisent aussi `API_BASE_URL`** qui est vide en développement, donc elles passent aussi par le proxy Vite.

## 📋 Résumé des Endpoints Admin

Tous les endpoints admin utilisent des chemins relatifs `/api/...` :

### Courses Admin
- ✅ `/api/courses/admin/courses/` (GET, POST)
- ✅ `/api/courses/admin/courses/{id}/` (GET, PUT, DELETE)
- ✅ `/api/courses/admin/lessons/` (GET, POST)
- ✅ `/api/courses/admin/lessons/{id}/` (GET, PUT, DELETE)
- ✅ `/api/courses/categories/` (GET)

### Sermons Admin
- ✅ `/api/admin/sermons/sermons/` (GET, POST)
- ✅ `/api/admin/sermons/sermons/{id}/` (GET, PUT, DELETE)
- ✅ `/api/sermons/categories/` (GET)

### Shops Admin
- ✅ `/api/admin/shops/shops/` (GET, POST)
- ✅ `/api/admin/shops/shops/{id}/` (GET, PUT, DELETE)
- ✅ `/api/shops/categories/` (GET)

### Settings Admin
- ✅ `/api/settings/current/` (GET)
- ✅ `/api/settings/{id}/` (GET, PUT, PATCH)

### Users Admin
- ✅ `/api/accounts/users/` (GET, POST)
- ✅ `/api/accounts/users/{id}/` (GET, PUT, DELETE)

## ✅ Conclusion

**Tous les appels API (frontend et administration) utilisent correctement le proxy Vite :**

1. ✅ **Proxy Vite configuré** : `/api` → `http://localhost:8000`
2. ✅ **API_BASE_URL vide en dev** : Tous les appels utilisent des chemins relatifs
3. ✅ **Aucun appel direct** : Tous passent par `apiGet`, `apiPost`, etc.
4. ✅ **Tous les endpoints admin** : Utilisent des chemins relatifs `/api/...`
5. ✅ **URLs d'images** : Utilisent aussi le proxy via `API_BASE_URL`

## 🚀 Flux des Requêtes

```
Frontend (localhost:8080)
    ↓
Requête: GET /api/courses/admin/courses/
    ↓
Proxy Vite (vite.config.ts)
    ↓
Backend Django (localhost:8000)
    ↓
Réponse JSON
    ↓
Frontend
```

**Tout fonctionne correctement ! ✅**

