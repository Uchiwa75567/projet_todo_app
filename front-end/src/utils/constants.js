export const API_BASE_URL = 'http://localhost:3000';

// Statuts possibles pour une tâche
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// Priorités possibles pour une tâche
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Labels pour les statuts
export const STATUS_LABELS = {
  [TASK_STATUS.TODO]: 'À faire',
  [TASK_STATUS.IN_PROGRESS]: 'En cours',
  [TASK_STATUS.COMPLETED]: 'Terminée',
};

// Labels pour les priorités
export const PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: 'Basse',
  [TASK_PRIORITY.MEDIUM]: 'Moyenne',
  [TASK_PRIORITY.HIGH]: 'Haute',
};