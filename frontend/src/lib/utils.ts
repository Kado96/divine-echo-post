import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripHtml(html: string) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')   // Replace non-breaking spaces
    .replace(/&amp;/g, '&')    // Replace ampersands
    .replace(/&lt;/g, '<')     // Replace less than
    .replace(/&gt;/g, '>')     // Replace greater than
    .replace(/&quot;/g, '"');  // Replace quotes
}

/**
 * Filtre les titres pour éviter d'afficher des noms de fichiers techniques (ex: image.jpg)
 * sur le site public.
 */
export function formatPublicTitle(title: string | null | undefined): string {
  if (!title) return "";
  
  // Si le titre contient une extension de fichier courante, on le considère comme technique
  const fileExtensionPattern = /\.(jpg|jpeg|png|gif|webp|svg|mp3|wav|ogg|mp4|mov|webm|pdf|doc|docx)$/i;
  if (fileExtensionPattern.test(title)) {
    return "";
  }
  
  return title;
}

export function getFullImageUrl(url: string | null | undefined): string {
  if (!url) return "";

  const isDev = import.meta.env.DEV;
  const prodDomain = "shalom-ministry-backend-ipu3.onrender.com";
  const localDomain = "localhost:8000";

  // If it's already an absolute URL or a dynamic preview URL (blob/data)
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    // 🔥 PROTECTION CORB : Si c'est du Google Drive, on passe par notre proxy backend
    if (url.includes('drive.google.com')) {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      return `${apiUrl}/image-proxy/?url=${encodeURIComponent(url)}`;
    }
    
    let resultUrl = url;
    
    /* 
    // Suppression du swap automatique car si le fichier n'est pas présent localement, cela casse le lien.
    // On fait confiance à l'URL absolue renvoyée par l'API.
    if (isDev && url.includes(prodDomain)) {
      resultUrl = url.replace(prodDomain, localDomain).replace('https://', 'http://');
    }
    */
    
    // Fix localhost https issue
    if (resultUrl.startsWith('https://') && resultUrl.includes('localhost')) {
      return resultUrl.replace('https://', 'http://');
    }
    return resultUrl;
  }

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const baseUrl = apiUrl.replace('/api', '').replace(/\/$/, '');

  // Handle missing media prefix robustly for local development
  let relativePath = url.startsWith('/') ? url : `/${url}`;
  
  // If the URL looks like a media path but is missing the /api/media/ prefix
  if (!relativePath.startsWith('/api/media/') && !relativePath.startsWith('/static/')) {
    if (relativePath.startsWith('/sermons/') || relativePath.startsWith('/settings/') || relativePath.startsWith('/announcements/')) {
       relativePath = `/api/media${relativePath}`;
    }
  }

  // 🔥 Sécurisation des caractères spéciaux (espaces, accents) pour les fichiers locaux/Android
  const encodedPath = relativePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
  const fullUrl = `${baseUrl}${encodedPath}`;

  if (fullUrl.includes('localhost') && fullUrl.startsWith('https://')) {
    return fullUrl.replace('https://', 'http://');
  }

  return fullUrl;
}

/**
 * Récupère dynamiquement un champ localisé (ex: title_fr, title_en) 
 * avec un fallback intelligent vers le champ de base ou le français.
 */
export function getLocalizedField(obj: any, fieldName: string, lang: string = 'fr'): string {
  if (!obj) return "";
  
  // Normalisation du code langue (ex: 'fr-FR' -> 'fr')
  const safeLang = (lang || 'fr').split('-')[0].toLowerCase();
  
  // 1. Tenter le champ spécifique à la langue (ex: title_fr)
  const langField = `${fieldName}_${safeLang}`;
  if (obj[langField] && typeof obj[langField] === 'string' && obj[langField].trim() !== "") {
    return obj[langField];
  }
  
  // 2. Tenter le champ de base (ex: title) - souvent utilisé pour la langue par défaut (FR)
  if (obj[fieldName] && typeof obj[fieldName] === 'string' && obj[fieldName].trim() !== "") {
    return obj[fieldName];
  }
  
  // 3. Fallback vers le français explicite si différent de la langue demandée
  if (safeLang !== 'fr') {
    const frField = `${fieldName}_fr`;
    if (obj[frField] && typeof obj[frField] === 'string' && obj[frField].trim() !== "") {
      return obj[frField];
    }
  }
  
  return "";
}
