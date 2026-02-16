// API Configuration
// En desarrollo con Docker, usa el proxy de Vite/nginx (/api)
// En producción, usa la variable de entorno VITE_API_URL

const isDevelopment = import.meta.env.DEV;
const isDocker = window.location.port === '3000'; // Puerto del frontend en Docker

export const API_BASE_URL = isDevelopment && isDocker
  ? '/api' // Usa proxy cuando está en Docker (puerto 3000)
  : import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getApiUrl = (endpoint) => {
  // Si el endpoint ya incluye /api, no lo duplicar
  if (endpoint.startsWith('/api')) {
    return isDevelopment && isDocker ? endpoint : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`;
  }
  // Si no, agregar el base URL
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export default {
  API_BASE_URL,
  getApiUrl
};
