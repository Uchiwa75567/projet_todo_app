// Interface définissant la structure complète d'une tâche
export interface Task {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date | null; // Date de début de la tâche
  endDate?: Date | null;   // Date de fin de la tâche
  userId: number;
  image?: string | null; // nom du fichier
  file?: string | null;  // nom du fichier
  voice?: string | null; // nom du fichier audio pour les messages vocaux
}

// Type pour la création d'une nouvelle tâche (sans id et dates)
export type CreateTaskDTO = {
  title: string;
  description?: string;
  startDate?: Date | null; // Date de début de la tâche
  endDate?: Date | null;   // Date de fin de la tâche
  completed?: boolean;
  image?: string | null; // nom du fichier
  file?: string | null;  // nom du fichier
  voice?: string | null; // nom du fichier audio pour les messages vocaux
};

export type UpdateTaskDTO = Partial<CreateTaskDTO> & {
  completed?: boolean;
};





// Type pour la mise à jour d'une tâche (tous les champs sont optionnels)

// export type UpdateTaskDTO = Partial<CreateTaskDTO> & {
//   completed?: boolean;  // Ajout du champ completed optionnel
// };

// Interface pour les notifications
export interface Notification {
  id: number;
  message: string;
  type: string; // 'task_started', 'task_completed', 'task_modified'
  read: boolean;
  createdAt: Date;
  userId: number;
  taskId?: number | null;
}
