import prisma from '../utils/prismaClient.js';
import { Notification } from '../types/task.types.js';

export class NotificationRepository {

  // Créer une notification
  async create(data: {
    message: string;
    type: string;
    userId: number;
    taskId?: number | null;
  }): Promise<Notification> {
    return prisma.notification.create({
      data
    });
  }

  // Récupérer les notifications d'un utilisateur
  async findByUserId(userId: number): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Marquer une notification comme lue
  async markAsRead(id: number, userId: number): Promise<Notification | null> {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true }
    }).then(() => prisma.notification.findUnique({ where: { id } }));
  }

  // Marquer toutes les notifications d'un utilisateur comme lues
  async markAllAsRead(userId: number): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId },
      data: { read: true }
    });
  }

  // Supprimer une notification
  async delete(id: number, userId: number): Promise<void> {
    await prisma.notification.deleteMany({
      where: { id, userId }
    });
  }

  // Compter les notifications non lues d'un utilisateur
  async countUnread(userId: number): Promise<number> {
    return prisma.notification.count({
      where: { userId, read: false }
    });
  }
}
