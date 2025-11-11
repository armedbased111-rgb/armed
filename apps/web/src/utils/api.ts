// apps/web/src/utils/api.ts
// Utilitaire pour construire les URLs de l'API

// En développement avec HTTPS, utiliser le proxy Vite pour éviter mixed content
// En production, utiliser la variable d'environnement ou l'URL absolue
const getApiBaseUrl = () => {
  // En développement, utiliser le proxy Vite si on est en HTTPS
  if (import.meta.env.DEV) {
    // Si on est en HTTPS (détecté par le protocole), utiliser le proxy
    if (window.location.protocol === "https:") {
      return "/api";
    }
    // Sinon, utiliser l'URL directe en HTTP
    return import.meta.env.VITE_API_URL || "http://localhost:4000";
  }
  
  // En production, utiliser la variable d'environnement
  return import.meta.env.VITE_API_URL || "";
};

export const API_BASE_URL = getApiBaseUrl();

export const buildApiUrl = (path: string): string => {
  // Si le chemin commence déjà par http, le retourner tel quel
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // Nettoyer le chemin (enlever le slash initial si présent)
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  
  // Si on utilise le proxy Vite (/api), construire le chemin relatif
  if (API_BASE_URL === "/api") {
    return `/api/${cleanPath}`;
  }
  
  // Sinon, construire l'URL complète avec le base URL
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${baseUrl}/${cleanPath}`;
};

