import { NotificationService } from '../services/NotificationService.js';
export class NotificationController {
    constructor() {
        this.notificationService = new NotificationService();
    }
    // Récupérer les notifications d'un utilisateur
    async getUserNotifications(req, res) {
        try {
            const userId = req.user.id;
            const notifications = await this.notificationService.getUserNotifications(userId);
            res.json(notifications);
        }
        catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des notifications" });
        }
    }
    // Marquer une notification comme lue
    async markAsRead(req, res) {
        try {
            const notificationId = Number(req.params.id);
            const userId = req.user.id;
            const notification = await this.notificationService.markAsRead(notificationId, userId);
            if (!notification) {
                return res.status(404).json({ error: "Notification non trouvée" });
            }
            res.json(notification);
        }
        catch (error) {
            res.status(500).json({ error: "Erreur lors de la mise à jour de la notification" });
        }
    }
    // Marquer toutes les notifications comme lues
    async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            await this.notificationService.markAllAsRead(userId);
            res.json({ message: "Toutes les notifications ont été marquées comme lues" });
        }
        catch (error) {
            res.status(500).json({ error: "Erreur lors de la mise à jour des notifications" });
        }
    }
    // Supprimer une notification
    async deleteNotification(req, res) {
        try {
            const notificationId = Number(req.params.id);
            const userId = req.user.id;
            await this.notificationService.deleteNotification(notificationId, userId);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: "Erreur lors de la suppression de la notification" });
        }
    }
    // Compter les notifications non lues
    async countUnread(req, res) {
        try {
            const userId = req.user.id;
            const count = await this.notificationService.countUnread(userId);
            res.json({ unreadCount: count });
        }
        catch (error) {
            res.status(500).json({ error: "Erreur lors du comptage des notifications" });
        }
    }
}
