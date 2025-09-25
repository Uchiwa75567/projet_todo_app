// Formate une date (ex: 20 septembre 2025)
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Formate une date et heure (ex: 20 septembre 2025, 14:30)
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Vérifie si une tâche est en retard
export const isTaskOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

// Retourne les classes Tailwind pour le statut d'une tâche
export const getTaskStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'todo':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Retourne les classes Tailwind pour la priorité d'une tâche
export const getTaskPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-green-100 text-green-800';
  }
};

// Tronque un texte trop long
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Gère les erreurs d'API et retourne un message utilisateur
export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data?.message || 'Erreur du serveur';
  } else if (error.request) {
    return 'Impossible de contacter le serveur';
  } else {
    return error.message || "Une erreur inattendue s'est produite";
  }
};