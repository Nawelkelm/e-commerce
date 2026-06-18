// API Configuration
// En desarrollo con Docker, usa el proxy de Vite/nginx (/api)
// En producción, usa la variable de entorno VITE_API_URL

// En producción se DEBE definir VITE_API_URL (build de Vite).
// Fallback: en dev apunta al backend local; en prod, ruta relativa /api.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

export const getApiUrl = (endpoint) => {
  // Si el endpoint ya incluye /api, no lo duplicar
  if (endpoint.startsWith('/api')) {
    return endpoint;
  }
  // Si no, agregar el base URL
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export default {
  API_BASE_URL,
  getApiUrl
};
