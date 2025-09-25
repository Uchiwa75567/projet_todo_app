import { TaskService } from '../services/TaskService.js';
export class TaskController {
    constructor() {
        this.taskService = new TaskService();
    }
    // --- GET ALL ---
    async getAllTasks(req, res) {
        try {
            const tasks = await this.taskService.getAllTasks();
            const result = tasks.map(t => ({
                ...t,
                image: t.image ? `${req.protocol}://${req.get('host')}/uploads/${t.image}` : null,
                file: t.file ? `${req.protocol}://${req.get('host')}/uploads/${t.file}` : null
            }));
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des tâches" });
        }
    }
    // --- GET BY ID ---
    async getTaskById(req, res) {
        try {
            const id = Number(req.params.id);
            const task = await this.taskService.getTaskById(id);
            if (!task)
                return res.status(404).json({ error: "Task not found" });
            return res.json({
                ...task,
                image: task.image ? `${req.protocol}://${req.get('host')}/uploads/${task.image}` : null,
                file: task.file ? `${req.protocol}://${req.get('host')}/uploads/${task.file}` : null
            });
        }
        catch (error) {
            return res.status(error?.status ?? 500).json({ error: error?.message ?? "Internal error" });
        }
    }
    // --- CREATE ---
    async createTask(req, res) {
        try {
            const userId = req.user.id;
            const { title, description } = req.body;
            if (!title)
                return res.status(400).json({ error: "Le champ 'title' est obligatoire" });
            const files = req.files;
            const imageName = files?.image?.[0]?.filename ?? null;
            const fileName = files?.file?.[0]?.filename ?? null;
            const task = await this.taskService.createTask(userId, {
                title,
                description: description ?? undefined,
                image: imageName,
                file: fileName
            });
            return res.status(201).json(task);
        }
        catch (err) {
            return res.status(err?.status ?? 500).json({ error: err?.message ?? 'Internal error' });
        }
    }
    // --- UPDATE ---
    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const data = req.body;
            const files = req.files;
            if (files?.image?.[0])
                data.image = files.image[0].filename;
            if (files?.file?.[0])
                data.file = files.file[0].filename;
            const updated = await this.taskService.updateTask(Number(id), userId, data);
            res.json(updated);
        }
        catch (error) {
            res.status(500).json({ error: "Erreur lors de la mise à jour de la tâche" });
        }
    }
    // --- DELETE ---
    async deleteTask(req, res) {
        try {
            const id = Number(req.params.id);
            const userId = req.user.id;
            await this.taskService.deleteTask(id, userId);
            return res.status(204).send();
        }
        catch (err) {
            return res.status(err?.status ?? 500).json({ error: err?.message ?? 'Internal error' });
        }
    }
    // --- PERMISSIONS ---
    async grantPermission(req, res) {
        try {
            const taskId = Number(req.params.id);
            const ownerId = req.user.id;
            const { userId, canEdit, canDelete } = req.body;
            const permission = await this.taskService.grantPermission(taskId, ownerId, Number(userId), canEdit === true || canEdit === 'true', canDelete === true || canDelete === 'true');
            return res.json(permission);
        }
        catch (err) {
            return res.status(err?.status ?? 500).json({ error: err?.message ?? 'Internal error' });
        }
    }
}
