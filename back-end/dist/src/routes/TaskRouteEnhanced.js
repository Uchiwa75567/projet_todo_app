import { Router } from 'express';
import { TaskController } from '../controllers/TaskController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { upload, validateAudioDuration } from '../middlewares/enhancedFileUpload.js';
import { getHistory } from '../controllers/ActionLogController.js';
const router = Router();
const taskController = new TaskController();
// GET ALL
router.get('/', authMiddleware, (req, res) => taskController.getAllTasks(req, res));
// GET ALL PAGINATED
router.get('/paginated', authMiddleware, (req, res) => taskController.getAllTasksPaginated(req, res));
// ✅ GET HISTORY (placé avant /:id)
router.get('/history', authMiddleware, getHistory);
// GET BY ID
router.get('/:id', authMiddleware, (req, res) => taskController.getTaskById(req, res));
// CREATE
router.post('/', authMiddleware, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'voice', maxCount: 1 }
]), validateAudioDuration, (req, res) => taskController.createTask(req, res));
// UPDATE (PUT/PATCH)
router.put('/:id', authMiddleware, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'voice', maxCount: 1 }
]), validateAudioDuration, (req, res) => taskController.updateTask(req, res));
router.patch('/:id', authMiddleware, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'voice', maxCount: 1 }
]), validateAudioDuration, (req, res) => taskController.updateTask(req, res));
// DELETE
router.delete('/:id', authMiddleware, (req, res) => taskController.deleteTask(req, res));
// PERMISSIONS
router.post('/:id/permissions', authMiddleware, (req, res) => taskController.grantPermission(req, res));
export default router;
