import { Router, Request, Response } from 'express';
import { TaskController } from '../controllers/TaskController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { upload, validateAudioDuration } from '../middlewares/enhancedFileUpload.js';
import { getHistory } from '../controllers/ActionLogController.js';

const router = Router();
const taskController = new TaskController();

// GET ALL
router.get('/', authMiddleware, (req: Request, res: Response) =>
  taskController.getAllTasks(req, res)
);

// GET ALL PAGINATED
router.get('/paginated', authMiddleware, (req: Request, res: Response) =>
  taskController.getAllTasksPaginated(req, res)
);

// ✅ GET HISTORY (placé avant /:id)
router.get('/history', authMiddleware, getHistory);

// GET BY ID
router.get('/:id', authMiddleware, (req: Request, res: Response) =>
  taskController.getTaskById(req as any, res)
);

// CREATE
router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'voice', maxCount: 1 }
  ]),
  validateAudioDuration,
  (req: Request, res: Response) => taskController.createTask(req as any, res)
);

// UPDATE (PUT/PATCH)
router.put(
  '/:id',
  authMiddleware,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'voice', maxCount: 1 }
  ]),
  validateAudioDuration,
  (req: Request, res: Response) => taskController.updateTask(req as any, res)
);

router.patch(
  '/:id',
  authMiddleware,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'voice', maxCount: 1 }
  ]),
  validateAudioDuration,
  (req: Request, res: Response) => taskController.updateTask(req as any, res)
);

// DELETE
router.delete('/:id', authMiddleware, (req: Request, res: Response) =>
  taskController.deleteTask(req as any, res)
);

// PERMISSIONS
router.post('/:id/permissions', authMiddleware, (req: Request, res: Response) =>
  taskController.grantPermission(req as any, res)
);

export default router;
