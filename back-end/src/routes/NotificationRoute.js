import express from 'express';
import { NotificationService } from '../services/NotificationService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
const notificationService = new NotificationService();

// GET /todo/notifications - Récupérer les notifications de l'utilisateur connecté
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await notificationService.getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
  }
});

// GET /todo/notifications/unread - Compter les notifications non lues
router.get('/unread', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.countUnread(userId);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Erreur comptage notifications non lues:', error);
    res.status(500).json({ error: 'Erreur lors du comptage des notifications' });
  }
});

// POST /todo/notifications/:id/read - Marquer une notification comme lue
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;
    const notification = await notificationService.markAsRead(notificationId, userId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Erreur marquage notification lue:', error);
    res.status(500).json({ error: 'Erreur lors du marquage de la notification' });
  }
});

// POST /todo/notifications/read-all - Marquer toutes les notifications comme lues
router.post('/read-all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await notificationService.markAllAsRead(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur marquage toutes notifications lues:', error);
    res.status(500).json({ error: 'Erreur lors du marquage des notifications' });
  }
});

// DELETE /todo/notifications/:id - Supprimer une notification
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;
    await notificationService.deleteNotification(notificationId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression notification:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la notification' });
  }
});

export default router;
