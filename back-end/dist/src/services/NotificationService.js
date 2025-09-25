import { NotificationRepository } from '../repositories/NotificationRepository.js';
export class NotificationService {
    constructor() {
        this.notificationRepository = new NotificationRepository();
    }
    // Créer une notification
    async createNotification(message, type, userId, taskId) {
        return this.notificationRepository.create({
            message,
            type,
            userId,
            taskId
        });
    }
    // Récupérer les notifications d'un utilisateur
    async getUserNotifications(userId) {
        return this.notificationRepository.findByUserId(userId);
    }
    // Marquer une notification comme lue
    async markAsRead(notificationId, userId) {
        return this.notificationRepository.markAsRead(notificationId, userId);
    }
    // Marquer toutes les notifications comme lues
    async markAllAsRead(userId) {
        return this.notificationRepository.markAllAsRead(userId);
    }
    // Supprimer une notification
    async deleteNotification(notificationId, userId) {
        return this.notificationRepository.delete(notificationId, userId);
    }
    // Compter les notifications non lues
    async countUnread(userId) {
        return this.notificationRepository.countUnread(userId);
    }
    // Créer une notification pour le propriétaire d'une tâche
    async notifyTaskOwner(taskId, message, type, actionUserId) {
        // Récupérer le propriétaire de la tâche
        const task = await this.getTaskOwner(taskId);
        if (!task || task.userId === actionUserId)
            return; // Ne pas notifier si c'est le propriétaire qui fait l'action
        await this.createNotification(message, type, task.userId, taskId);
    }
    // Méthode helper pour récupérer le propriétaire d'une tâche
    async getTaskOwner(taskId) {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        try {
            return await prisma.task.findUnique({
                where: { id: taskId },
                select: { userId: true }
            });
        }
        finally {
            await prisma.$disconnect();
        }
    }
}
