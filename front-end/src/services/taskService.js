import api from './api';

export const taskService = {
  // Obtenir toutes les tâches
  getAllTasks: async () => {
    try {
      const response = await api.get('/todo/tasks');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtenir une tâche par ID
  getTaskById: async (id) => {
    try {
      const response = await api.get(`/todo/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Créer une nouvelle tâche
  createTask: async (taskData) => {
    try {
      const formData = new FormData();

      // Préparer les données JSON pour les champs non-fichiers
      const jsonData = {
        title: taskData.title,
        description: taskData.description || '',
        startDate: taskData.startDate ? new Date(taskData.startDate).toISOString() : null,
        endDate: taskData.endDate ? new Date(taskData.endDate).toISOString() : null,
        completed: Boolean(taskData.completed)
      };

      formData.append('data', JSON.stringify(jsonData));

      // Ajouter les fichiers s'ils existent
      if (taskData.image && (taskData.image instanceof Blob || taskData.image instanceof File)) {
        formData.append('image', taskData.image);
      }
      if (taskData.file && (taskData.file instanceof Blob || taskData.file instanceof File)) {
        formData.append('file', taskData.file);
      }
      if (taskData.voice && (taskData.voice instanceof Blob || taskData.voice instanceof File)) {
        formData.append('voice', taskData.voice);
      }

      const response = await api.post('/todo/tasks', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mettre à jour une tâche
  updateTask: async (id, taskData) => {
    try {
      console.log('Début updateTask:', { id, taskData });

      // 1. Vérification des données
      if (!id) throw new Error('ID de tâche manquant');
      if (typeof taskData.completed !== 'boolean' && !taskData.title) {
        throw new Error('Titre obligatoire pour une mise à jour non-status');
      }

      // 2. Préparation des données
      let baseData = {
        title: String(taskData.title).trim(),
        description: String(taskData.description || '').trim(),
        startDate: taskData.startDate ? new Date(taskData.startDate).toISOString() : undefined,
        endDate: taskData.endDate ? new Date(taskData.endDate).toISOString() : undefined,
        completed: Boolean(taskData.completed)
      };

      // Inclure les champs de fichiers s'ils sont fournis (nouveaux fichiers ou null pour suppression)
      if (taskData.image !== undefined) {
        baseData.image = taskData.image;
      }
      if (taskData.file !== undefined) {
        baseData.file = taskData.file;
      }
      if (taskData.voice !== undefined) {
        baseData.voice = taskData.voice;
      }

      // Nettoyer les champs undefined
      Object.keys(baseData).forEach(key => {
        if (baseData[key] === undefined) {
          delete baseData[key];
        }
      });

      let finalData;
      let config = {};

      // 3. Gestion du format d'envoi
      const hasNewFiles = (taskData.image && (taskData.image instanceof Blob || taskData.image instanceof File)) ||
                          (taskData.file && (taskData.file instanceof Blob || taskData.file instanceof File)) ||
                          (taskData.voice && (taskData.voice instanceof Blob || taskData.voice instanceof File));

      if (hasNewFiles) {
        finalData = new FormData();
        // Ajouter les données JSON
        finalData.append('data', JSON.stringify(baseData));
        // Ajouter les nouveaux fichiers seulement
        if (taskData.image && (taskData.image instanceof Blob || taskData.image instanceof File)) {
          finalData.append('image', taskData.image);
        }
        if (taskData.file && (taskData.file instanceof Blob || taskData.file instanceof File)) {
          finalData.append('file', taskData.file);
        }
        if (taskData.voice && (taskData.voice instanceof Blob || taskData.voice instanceof File)) {
          finalData.append('voice', taskData.voice);
        }

        config.headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        finalData = baseData;
        config.headers = { 'Content-Type': 'application/json' };
      }

      console.log('Données préparées:', { 
        id, 
        data: finalData instanceof FormData ? 
          Object.fromEntries(finalData.entries()) : 
          finalData,
        config 
      });

      // Logging détaillé pour débogage
      console.log('Envoi de la requête PUT avec les données:', finalData);
      console.log('Headers:', config.headers);

      // 4. Envoi de la requête
      const response = await api.put(`/todo/tasks/${id}`, finalData, config);

      // 5. Vérification de la réponse
      if (!response || !response.data) {
        throw new Error('Réponse invalide du serveur');
      }

      console.log('Réponse du serveur:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      
      // Gestion spécifique des erreurs selon le statut HTTP
      if (error.response?.status === 403) {
        throw new Error("Vous n'avez pas les permissions requises pour modifier cette tâche.");
      }
      
      // Pour les erreurs 500, vérifier si c'est lié aux permissions
      if (error.response?.status === 500) {
        // Supposer que toute erreur 500 lors de la modification est liée aux permissions
        throw new Error("Vous n'avez pas les permissions requises pour modifier cette tâche.");
      }
      
      // Pour les autres erreurs, utiliser le message du serveur si disponible
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error("Une erreur s'est produite. Veuillez réessayer.");
    }
  },

  // Marquer une tâche comme terminée ou non terminée
  toggleTaskCompletion: async (id, completed) => {
    console.log('Changement du statut de la tâche:', { id, completed });
    try {
      return await taskService.updateTask(id, { completed });
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      // Propager le message d'erreur approprié
      if (error.response?.status === 403 || 
          (error.response?.status === 500 && error.response?.data?.error?.includes('permission'))) {
        throw new Error("Vous n'avez pas les permissions requises pour modifier cette tâche.");
      }
      throw error;
    }
  },

  // Supprimer une tâche
  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/todo/tasks/${id}`);
      // Une réponse avec status 200 ou 204 est considérée comme un succès
      if (response.status === 200 || response.status === 204) {
        return { success: true };
      }
      throw new Error('Échec de la suppression');
    } catch (error) {
      console.error('Erreur deleteTask:', error);
      
      // Gestion spécifique des erreurs de permission
      if (error.response?.status === 403 || 
          (error.response?.status === 500 && error.response?.data?.error?.includes('permission'))) {
        throw new Error("Vous n'avez pas les permissions requises pour supprimer cette tâche.");
      }
      
      // Autres erreurs
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error("Une erreur s'est produite lors de la suppression de la tâche");
    }
  },

  // Donner des permissions sur une tâche
  grantPermission: async (taskId, userId, permissions) => {
    try {
      const response = await api.post(`/todo/tasks/${taskId}/permissions`, {
        userId,
        canEdit: permissions.canEdit || false,
        canDelete: permissions.canDelete || false
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtenir l'historique des actions
  getHistory: async () => {
    try {
      const response = await api.get('/todo/tasks/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // --- NOTIFICATIONS ---
  // Obtenir les notifications de l'utilisateur
  getNotifications: async () => {
    try {
      const response = await api.get('/todo/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Compter les notifications non lues
  getUnreadCount: async () => {
    try {
      const response = await api.get('/todo/notifications/unread-count');
      return response.data.unreadCount;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/todo/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async () => {
    try {
      const response = await api.put('/todo/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Supprimer une notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/todo/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
