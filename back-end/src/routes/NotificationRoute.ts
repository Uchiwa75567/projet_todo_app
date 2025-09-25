import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const notificationController = new NotificationController();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /notifications - Récupérer les notifications de l'utilisateur
router.get('/', (req, res) => notificationController.getUserNotifications(req, res));

// GET /notifications/unread-count - Compter les notifications non lues
router.get('/unread-count', (req, res) => notificationController.countUnread(req, res));

// PUT /notifications/:id/read - Marquer une notification comme lue
router.put('/:id/read', (req, res) => notificationController.markAsRead(req, res));

// PUT /notifications/mark-all-read - Marquer toutes les notifications comme lues
router.put('/mark-all-read', (req, res) => notificationController.markAllAsRead(req, res));

// DELETE /notifications/:id - Supprimer une notification
router.delete('/:id', (req, res) => notificationController.deleteNotification(req, res));

export default router;
