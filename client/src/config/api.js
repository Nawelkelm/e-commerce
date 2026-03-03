// API Configuration
// En desarrollo con Docker, usa el proxy de Vite/nginx (/api)
// En producción, usa la variable de entorno VITE_API_URL

const isDevelopment = import.meta.env.DEV;
const isDocker = window.location.port === '3000'; // Puerto del frontend en Docker

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
