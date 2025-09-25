import { TaskRepository } from '../repositories/TaskRepository.js';
import { TaskPermissionRepository } from '../repositories/TaskPermissionRepository.js';
import { NotificationService } from './NotificationService.js';
export class TaskService {
    constructor() {
        this.taskRepository = new TaskRepository();
        this.permissionRepo = new TaskPermissionRepository();
        this.notificationService = new NotificationService();
    }
    // --- READ ---
    async getAllTasks() {
        return this.taskRepository.findAll();
    }
    async getAllTasksPaginated(page = 1, limit = 5) {
        return this.taskRepository.findAllPaginated(page, limit);
    }
    async getTaskById(id) {
        return this.taskRepository.findById(id);
    }
    // --- CREATE ---
    async createTask(userId, data) {
        return this.taskRepository.create({ ...data, userId });
    }
    // --- UPDATE --->
    async updateTask(id, userId, data) {
        const existing = await this.taskRepository.findById(id);
        if (!existing)
            throw Object.assign(new Error('Task not found'), { status: 404 });
        const isOwner = Number(existing.userId) === Number(userId);
        const hasPermission = await this.permissionRepo.userCanEdit(id, userId);
        if (!isOwner && !hasPermission) {
            throw Object.assign(new Error("Vous n'avez pas les permissions requises pour modifier cette tâche."), { status: 403 });
        }
        const updatedTask = await this.taskRepository.update(id, data);
        // Créer une notification pour le propriétaire si c'est un utilisateur avec permission qui modifie
        if (!isOwner && hasPermission) {
            await this.notificationService.notifyTaskOwner(id, `Votre tâche "${existing.title}" a été modifiée par un utilisateur autorisé.`, 'task_modified', userId);
        }
        return updatedTask;
    }
    // --- DELETE ---
    async deleteTask(id, userId) {
        const existing = await this.taskRepository.findById(id);
        if (!existing)
            throw Object.assign(new Error('Task not found'), { status: 404 });
        const isOwner = existing.userId === userId;
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
    async grantPermission(taskId, ownerId, targetUserId, canEdit, canDelete) {
        const task = await this.taskRepository.findById(taskId);
        if (!task)
            throw Object.assign(new Error('Task not found'), { status: 404 });
        if (task.userId !== ownerId) {
            throw Object.assign(new Error('Seul le créateur peut attribuer des droits'), { status: 403 });
        }
        return this.permissionRepo.grantPermission(taskId, targetUserId, canEdit, canDelete);
    }
    // --- NOTIFICATIONS & SCHEDULING ---
    // Vérifier les tâches qui ont commencé et créer des notifications
    async checkAndNotifyTaskStarts() {
        const now = new Date();
        const tasks = await this.taskRepository.findTasksStartingToday(now);
        for (const task of tasks) {
            await this.notificationService.createNotification(`Votre tâche "${task.title}" a commencé aujourd'hui.`, 'task_started', task.userId, task.id);
        }
    }
    // Marquer automatiquement les tâches terminées à leur date de fin
    async autoCompleteExpiredTasks() {
        const now = new Date();
        const expiredTasks = await this.taskRepository.findExpiredTasks(now);
        for (const task of expiredTasks) {
            await this.taskRepository.update(task.id, { completed: true });
            await this.notificationService.createNotification(`Votre tâche "${task.title}" a été automatiquement marquée comme terminée.`, 'task_completed', task.userId, task.id);
        }
    }
}
