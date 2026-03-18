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

  // If it's already an absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If it's localhost in HTTPS, force HTTP (localhost:8000 doesn't support SSL)
    if (url.includes('localhost') && url.startsWith('https://')) {
      return url.replace('https://', 'http://');
    }
    // For production URLs, we can leave them as is or ensure HTTPS if needed
    return url;
  }

  // Base URL of the API (without /api at the end)
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const baseUrl = apiUrl.replace('/api', '').replace(/\/$/, '');

  // If the path is relative (/media/...)
  const relativePath = url.startsWith('/') ? url : `/${url}`;

  // Combine baseUrl and relativePath
  const fullUrl = `${baseUrl}${relativePath}`;

  // If the resulting URL is on localhost, ensure it's http
  if (fullUrl.includes('localhost') && fullUrl.startsWith('https://')) {
    return fullUrl.replace('https://', 'http://');
  }

  return fullUrl;
}
