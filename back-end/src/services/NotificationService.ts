import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { Notification } from '../types/task.types.js';
import { PrismaClient } from '@prisma/client';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  // Créer une notification
  async createNotification(
    message: string,
    type: string,
    userId: number,
    taskId?: number | null,
    actorId?: number
  ): Promise<Notification> {
    let formattedMessage = message;
    if (actorId && actorId !== userId) {
      const prisma = new PrismaClient();
      try {
        const actor = await prisma.user.findUnique({
          where: { id: actorId },
          select: { name: true }
        });
        if (actor) {
          formattedMessage = message.replace('votre', actor.name).replace('Votre', `${actor.name} a`);
          // Adjust based on type, e.g., for 'task_modified': `${actor.name} a modifié votre tâche`
          if (type === 'task_modified') {
            formattedMessage = `${actor.name} a modifié votre tâche "${message.split('"')[1] || 'une tâche'}"`;
          }
        }
      } finally {
        await prisma.$disconnect();
      }
    }
    return this.notificationRepository.create({
      message: formattedMessage,
      type,
      userId,
      taskId
    });
  }

  // Récupérer les notifications d'un utilisateur
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: number, userId: number): Promise<Notification | null> {
    return this.notificationRepository.markAsRead(notificationId, userId);
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId: number): Promise<void> {
    return this.notificationRepository.markAllAsRead(userId);
  }

  // Supprimer une notification
  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    return this.notificationRepository.delete(notificationId, userId);
  }

  // Compter les notifications non lues
  async countUnread(userId: number): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }

  // Créer une notification pour le propriétaire d'une tâche
  async notifyTaskOwner(taskId: number, message: string, type: string, actionUserId: number): Promise<void> {
    // Récupérer le propriétaire de la tâche
    const task = await this.getTaskOwner(taskId);
    if (!task || task.userId === actionUserId) return; // Ne pas notifier si c'est le propriétaire qui fait l'action

    await this.createNotification(message, type, task.userId, taskId, actionUserId);
  }

  // Méthode helper pour récupérer le propriétaire d'une tâche
  private async getTaskOwner(taskId: number) {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    try {
      return await prisma.task.findUnique({
        where: { id: taskId },
        select: { userId: true }
      });
    } finally {
      await prisma.$disconnect();
    }
  }
}
