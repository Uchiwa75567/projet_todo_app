import { TaskRepository } from '../repositories/TaskRepository.js';
import { TaskPermissionRepository } from '../repositories/TaskPermissionRepository.js';
import { NotificationService } from './NotificationService.js';
import { type Task, type CreateTaskDTO, type UpdateTaskDTO } from '../types/task.types.js';

export class TaskService {
  private taskRepository: TaskRepository;
  private permissionRepo: TaskPermissionRepository;
  private notificationService: NotificationService;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.permissionRepo = new TaskPermissionRepository();
    this.notificationService = new NotificationService();
  }

  // --- READ ---
  async getAllTasks(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  async getAllTasksPaginated(page: number = 1, limit: number = 5) {
    return this.taskRepository.findAllPaginated(page, limit);
  }

  async getTaskById(id: number): Promise<Task | null> {
    return this.taskRepository.findById(id);
  }

  // --- CREATE ---
  async createTask(userId: number, data: CreateTaskDTO): Promise<Task> {
  return this.taskRepository.create({ ...data, userId } as any);
}


  // --- UPDATE --->
  async updateTask(id: number, userId: number, data: UpdateTaskDTO): Promise<Task> {
  const existing = await this.taskRepository.findById(id);
  if (!existing) throw Object.assign(new Error('Task not found'), { status: 404 });

  const isOwner = Number((existing as any).userId) === Number(userId);
  const hasPermission = await this.permissionRepo.userCanEdit(id, userId);

  if (!isOwner && !hasPermission) {
    throw Object.assign(new Error("Vous n'avez pas les permissions requises pour modifier cette tâche."), { status: 403 });
  }

  const updatedTask = await this.taskRepository.update(id, data);

  // Créer une notification pour le propriétaire si c'est un utilisateur avec permission qui modifie
  if (!isOwner && hasPermission) {
    await this.notificationService.notifyTaskOwner(
      id,
      `Votre tâche "${existing.title}" a été modifiée.`,
      'task_modified',
      userId
    );
  }

  return updatedTask;
}


  // --- DELETE ---
  async deleteTask(id: number, userId: number): Promise<void> {
    const existing = await this.taskRepository.findById(id);
    if (!existing) throw Object.assign(new Error('Task not found'), { status: 404 });

    const isOwner = (existing as any).userId === userId;
    const hasPermission = await this.permissionRepo.userCanDelete(id, userId);

    if (!isOwner && !hasPermission) {
      throw Object.assign(new Error("Vous n'avez pas l'autorisation de supprimer cette tâche"), { status: 403 });
    }

    // ✅ Supprimer d'abord toutes les permissions liées
    await this.permissionRepo.deleteByTaskId(id);

    // ✅ Supprimer ensuite la tâche
    await this.taskRepository.delete(id);
  }

  // --- SHARE / PERMISSIONS ---
  async grantPermission(
    taskId: number,
    ownerId: number,
    targetUserId: number,
    canEdit: boolean,
    canDelete: boolean
  ) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });

    if ((task as any).userId !== ownerId) {
      throw Object.assign(new Error('Seul le créateur peut attribuer des droits'), { status: 403 });
    }

    return this.permissionRepo.grantPermission(taskId, targetUserId, canEdit, canDelete);
  }

  // --- NOTIFICATIONS & SCHEDULING ---
  // Vérifier les tâches qui ont commencé et créer des notifications
  async checkAndNotifyTaskStarts(): Promise<void> {
    const now = new Date();
    const tasks = await this.taskRepository.findTasksStartingToday(now);

    for (const task of tasks) {
      await this.notificationService.createNotification(
        `Votre tâche "${task.title}" a commencé aujourd'hui.`,
        'task_started',
        (task as any).userId,
        task.id
      );
    }
  }

  // Marquer automatiquement les tâches terminées à leur date de fin
  async autoCompleteExpiredTasks(): Promise<void> {
    const now = new Date();
    const expiredTasks = await this.taskRepository.findExpiredTasks(now);

    for (const task of expiredTasks) {
      await this.taskRepository.update(task.id, { completed: true });
      await this.notificationService.createNotification(
        `Votre tâche "${task.title}" a été automatiquement marquée comme terminée.`,
        'task_completed',
        (task as any).userId,
        task.id
      );
    }
  }
}
