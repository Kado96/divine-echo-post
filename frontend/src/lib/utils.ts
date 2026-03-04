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

export function getFullImageUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Si c'est déjà une URL absolue correcte, on la garde
  if (url.startsWith('https://')) return url;

  // Base URL de l'API (sans le /api à la fin)
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace('/api', '');

  // Si l'URL contient localhost, on remplace par la base URL de production
  if (url.includes('localhost:8000')) {
    return url.replace('http://localhost:8000', baseUrl).replace('http://', 'https://');
  }

  // Si l'URL est relative (commence par /media/ ou /api/media/)
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`.replace('http://', 'https://');
  }

  return url;
}

