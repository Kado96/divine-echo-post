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

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const isDev = import.meta.env.DEV;

  // If it's already an absolute URL or a dynamic preview URL (blob/data)
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    // 🔥 PROTECTION CORB/CORS : On passe par notre proxy backend pour TOUTES les images externes en production
    // Sauf si c'est déjà une URL de notre backend (on vérifie si l'URL contient le domaine de l'API)
    const backendDomain = new URL(apiUrl).hostname;
    const isExternal = !url.includes(backendDomain) && !url.includes('localhost') && !url.includes('127.0.0.1');
    
    if (isExternal && (url.startsWith('http://') || url.startsWith('https://'))) {
      return `${apiUrl}/image-proxy/?url=${encodeURIComponent(url)}`;
    }
    
    let resultUrl = url;
    
    // Fix localhost https issue in development
    if (isDev && resultUrl.startsWith('https://') && resultUrl.includes('localhost')) {
      return resultUrl.replace('https://', 'http://');
    }
    return resultUrl;
  }

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
 * Résout et encode l'URL d'un média (audio/vidéo) pour Supabase ou le Backend.
 * Gère l'encodage des segments pour la compatibilité mobile et le préfixe media/media/.
 */
export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return "";

  // 1. URL Absolue (Supabase ou autre)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('supabase.co/storage/')) {
      try {
        const urlObj = new URL(url);
        const segments = urlObj.pathname.split('/');
        // Encodage robuste de chaque segment (évite les erreurs 400 sur mobile)
        const encodedSegments = segments.map(s => encodeURIComponent(decodeURIComponent(s)));
        urlObj.pathname = encodedSegments.join('/');
        return urlObj.toString();
      } catch (e) {
        return url;
      }
    }
    return url;
  }

  // 2. Chemin relatif (Construction de l'URL Supabase directe)
  // On respecte la structure /media/media/ demandée
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  const supabaseProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'eiokoxdmgxxyexmqfsua';
  
  // Si le chemin ne contient pas déjà "media/", on l'ajoute pour respecter la structure du bucket
  const hasMediaPrefix = cleanPath.startsWith('media/');
  const fullPath = hasMediaPrefix ? cleanPath : `media/${cleanPath}`;
  
  const encodedSegments = fullPath.split('/').map(s => encodeURIComponent(decodeURIComponent(s)));
  const encodedPath = encodedSegments.join('/');
  
  return `https://${supabaseProjectId}.supabase.co/storage/v1/object/public/media/${encodedPath}`;
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
