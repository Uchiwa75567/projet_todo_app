import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { handleApiError } from '../utils/helpers';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger toutes les tâches
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await taskService.getAllTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(handleApiError(error));
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une nouvelle tâche
  const createTask = async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks(prevTasks => [newTask, ...prevTasks]);
      return newTask;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  // Mettre à jour une tâche
  const updateTask = async (taskId, taskData) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, taskData);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? updatedTask : task
        )
      );
      return updatedTask;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  // Supprimer une tâche
  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  // Changer le statut d'une tâche (completed/non-completed)
  const toggleTaskCompletion = async (taskId, completed) => {
    try {
      const updatedTask = await taskService.toggleTaskCompletion(taskId, completed);
      
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? updatedTask : t
        )
      );
      return updatedTask;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  // Filtrer les tâches
  const getCompletedTasks = () => {
    return tasks.filter(task => task.completed);
  };

  const getPendingTasks = () => {
    return tasks.filter(task => !task.completed);
  };

  // Statistiques
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.filter(task => !task.completed).length;

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  // Charger les tâches au montage du composant
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getCompletedTasks,
    getPendingTasks,
    getTaskStats
  };
};