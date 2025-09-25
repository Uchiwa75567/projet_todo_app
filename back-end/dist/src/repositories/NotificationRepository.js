import prisma from '../utils/prismaClient.js';
export class NotificationRepository {
    // Créer une notification
    async create(data) {
        return prisma.notification.create({
            data
        });
    }
    // Récupérer les notifications d'un utilisateur
    async findByUserId(userId) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    // Marquer une notification comme lue
    async markAsRead(id, userId) {
        return prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true }
        }).then(() => prisma.notification.findUnique({ where: { id } }));
    }
    // Marquer toutes les notifications d'un utilisateur comme lues
    async markAllAsRead(userId) {
        await prisma.notification.updateMany({
            where: { userId },
            data: { read: true }
        });
    }
    // Supprimer une notification
    async delete(id, userId) {
        await prisma.notification.deleteMany({
            where: { id, userId }
        });
    }
    // Compter les notifications non lues d'un utilisateur
    async countUnread(userId) {
        return prisma.notification.count({
            where: { userId, read: false }
        });
    }
}
