import axios from 'axios';

// Configuration de base de l'API
const API_BASE_URL = 'http://localhost:3000'; // je vais le remplacer par mon URL backend

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

  // Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    // Pour les requêtes DELETE, on accepte les réponses vides
    if (response.config.method === 'delete') {
      return response;
    }
    // Pour les autres requêtes, on vérifie la présence de données
    if (!response.data && response.config.method !== 'delete') {
      throw new Error('Réponse invalide du serveur');
    }
    return response;
  },
  (error) => {
    // Log détaillé de l'erreur pour le débogage
    const errorDetails = {
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data instanceof FormData 
          ? Object.fromEntries(error.config.data.entries())
          : error.config?.data
      }
    };
    
    console.error('API Error:', errorDetails);

    // Gestion des erreurs par type
    switch (error.response?.status) {
      case 400:
        error.message = error.response.data?.error || 'Données invalides. Veuillez vérifier votre saisie.';
        break;
      case 401:
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        error.message = 'Session expirée. Veuillez vous reconnecter.';
        window.location.href = '/login';
        break;
      case 403:
        error.message = 'Vous n\'avez pas les permissions requises pour effectuer cette action.';
        break;
      case 404:
        error.message = 'Ressource non trouvée.';
        break;
      case 500:
        // Si c'est une erreur de permission du backend
        if (error.response.data?.error?.includes('permission')) {
          error.message = 'Vous n\'avez pas les permissions requises pour effectuer cette action.';
        } else {
          console.error('Erreur serveur détectée:', error.response.data);
          error.message = 'Une erreur est survenue côté serveur. Veuillez réessayer.';
        }
        break;
      default:
        error.message = error.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.';
    }

    return Promise.reject(error);
  }
);export default api;