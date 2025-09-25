import { TaskRepository } from '../repositories/TaskRepository.js';
import { TaskPermissionRepository } from '../repositories/TaskPermissionRepository.js';
export class TaskService {
    constructor() {
        this.taskRepository = new TaskRepository();
        this.permissionRepo = new TaskPermissionRepository();
    }
    // --- READ ---
    async getAllTasks() {
        return this.taskRepository.findAll();
    }
    async getTaskById(id) {
        return this.taskRepository.findById(id);
    }
    // --- CREATE ---
    async createTask(userId, data) {
        return this.taskRepository.create({ ...data, userId });
    }
    // --- UPDATE ---
    async updateTask(id, userId, data) {
        const existing = await this.taskRepository.findById(id);
        if (!existing)
            throw Object.assign(new Error('Task not found'), { status: 404 });
        const isOwner = existing.userId === userId;
        const hasPermission = await this.permissionRepo.userCanEdit(id, userId);
        if (!isOwner && !hasPermission) {
            throw Object.assign(new Error("Vous n'avez pas l'autorisation de modifier cette tâche"), { status: 403 });
        }
        return this.taskRepository.update(id, data);
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
}
