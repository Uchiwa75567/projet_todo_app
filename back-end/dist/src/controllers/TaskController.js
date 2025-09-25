import { TaskService } from '../services/TaskService.js';
import { actionLogService } from '../services/ActionLogService.js';
import fs from 'fs';
import path from 'path';
export class TaskController {
    constructor() {
        this.taskService = new TaskService();
    }
    deleteFile(filename) {
        const filePath = path.join(process.cwd(), 'uploads', filename);
        fs.unlink(filePath, (err) => {
            if (err)
                console.error(`Error deleting file ${filename}:`, err);
        });
    }
    // --- GET ALL ---
    async getAllTasks(req, res) {
        try {
            const tasks = await this.taskService.getAllTasks();
            const result = tasks.map(t => ({
                ...t,
                image: t.image ? `${req.protocol}://${req.get('host')}/uploads/${t.image}` : null,
                file: t.file ? `${req.protocol}://${req.get('host')}/uploads/${t.file}` : null,
                voice: t.voice ? `${req.protocol}://${req.get('host')}/uploads/${t.voice}` : null
            }));
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des tâches" });
        }
    }
    // --- GET ALL PAGINATED ---
    async getAllTasksPaginated(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const result = await this.taskService.getAllTasksPaginated(page, limit);
            // Ajouter les URLs complètes pour les fichiers
            const tasksWithUrls = result.data.map(t => ({
                ...t,
                image: t.image ? `${req.protocol}://${req.get('host')}/uploads/${t.image}` : null,
                file: t.file ? `${req.protocol}://${req.get('host')}/uploads/${t.file}` : null,
                voice: t.voice ? `${req.protocol}://${req.get('host')}/uploads/${t.voice}` : null
            }));
            res.json({
                ...result,
                data: tasksWithUrls
            });
        }
        catch (error) {
            res.status(500).json({ error: "Erreur lors de la récupération des tâches paginées" });
        }
    }
    // --- GET BY ID ---
    async getTaskById(req, res) {
        try {
            const id = Number(req.params.id);
            const task = await this.taskService.getTaskById(id);
            if (!task)
                return res.status(404).json({ error: "Task not found" });
            // Log READ action
            await actionLogService.logAction("READ", task.id, req.user.id);
            return res.json({
                ...task,
                image: task.image ? `${req.protocol}://${req.get('host')}/uploads/${task.image}` : null,
                file: task.file ? `${req.protocol}://${req.get('host')}/uploads/${task.file}` : null,
                voice: task.voice ? `${req.protocol}://${req.get('host')}/uploads/${task.voice}` : null
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
            const data = JSON.parse(req.body.data);
            const { title, description, completed } = data;
            if (!title)
                return res.status(400).json({ error: "Le champ 'title' est obligatoire" });
            const files = req.files;
            const imageName = files?.image?.[0]?.filename ?? null;
            const fileName = files?.file?.[0]?.filename ?? null;
            const voiceName = files?.voice?.[0]?.filename ?? null;
            const task = await this.taskService.createTask(userId, {
                title,
                description: description ?? undefined,
                completed: completed ?? false,
                image: imageName,
                file: fileName,
                voice: voiceName
            });
            // Log CREATE action
            await actionLogService.logAction("CREATE", task.id, userId);
            return res.status(201).json({
                ...task,
                image: task.image ? `${req.protocol}://${req.get('host')}/uploads/${task.image}` : null,
                file: task.file ? `${req.protocol}://${req.get('host')}/uploads/${task.file}` : null,
                voice: task.voice ? `${req.protocol}://${req.get('host')}/uploads/${task.voice}` : null
            });
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
            // Get existing task to handle file deletions
            const existing = await this.taskService.getTaskById(Number(id));
            if (!existing)
                return res.status(404).json({ error: "Task not found" });
            const updateData = {};
            const files = req.files;
            // Parse JSON data if present (for multipart requests)
            let bodyData = {};
            if (req.body.data) {
                try {
                    bodyData = JSON.parse(req.body.data);
                }
                catch (e) {
                    return res.status(400).json({ error: "Données invalides" });
                }
            }
            else {
                // For simple JSON requests
                bodyData = req.body;
            }
            // Handle text fields from parsed data
            if (bodyData.title !== undefined)
                updateData.title = bodyData.title;
            if (bodyData.description !== undefined)
                updateData.description = bodyData.description;
            if (bodyData.completed !== undefined)
                updateData.completed = bodyData.completed === 'true' || bodyData.completed === true;
            // Handle image
            if (files?.image?.[0]) {
                if (existing.image)
                    this.deleteFile(existing.image);
                updateData.image = files.image[0].filename;
            }
            else if (bodyData.image === null || bodyData.image === "null") {
                if (existing.image)
                    this.deleteFile(existing.image);
                updateData.image = null;
            }
            // Handle file
            if (files?.file?.[0]) {
                if (existing.file)
                    this.deleteFile(existing.file);
                updateData.file = files.file[0].filename;
            }
            else if (bodyData.file === null || bodyData.file === "null") {
                if (existing.file)
                    this.deleteFile(existing.file);
                updateData.file = null;
            }
            // Handle voice
            if (files?.voice?.[0]) {
                if (existing.voice)
                    this.deleteFile(existing.voice);
                updateData.voice = files.voice[0].filename;
            }
            else if (bodyData.voice === null || bodyData.voice === "null") {
                if (existing.voice)
                    this.deleteFile(existing.voice);
                updateData.voice = null;
            }
            const updated = await this.taskService.updateTask(Number(id), userId, updateData);
            // Log UPDATE action
            await actionLogService.logAction("UPDATE", updated.id, userId);
            // Return with full URLs
            const result = {
                ...updated,
                image: updated.image ? `${req.protocol}://${req.get('host')}/uploads/${updated.image}` : null,
                file: updated.file ? `${req.protocol}://${req.get('host')}/uploads/${updated.file}` : null,
                voice: updated.voice ? `${req.protocol}://${req.get('host')}/uploads/${updated.voice}` : null
            };
            res.json(result);
        }
        catch (error) {
            // Check if error has a status property (e.g., 403 for permission errors)
            const status = error.status || 500;
            const message = error.message || "Erreur lors de la mise à jour de la tâche";
            res.status(status).json({ error: message });
        }
    }
    // --- DELETE ---
    async deleteTask(req, res) {
        try {
            const id = Number(req.params.id);
            const userId = req.user.id;
            // Vérifier que la tâche existe avant de logger
            const task = await this.taskService.getTaskById(id);
            if (task) {
                await actionLogService.logAction("DELETE", id, userId);
            }
            await this.taskService.deleteTask(id, userId);
            return res.status(204).send();
        }
        catch (err) {
            console.error('Erreur suppression tâche', err);
            return res.status(err?.status ?? 500).json({ error: err?.message ?? 'Internal error' });
        }
    }
    // --- PERMISSIONS ---
    async grantPermission(req, res) {
        try {
            const taskId = Number(req.params.id);
            const ownerId = req.user.id;
            const { userId, canEdit, canDelete } = req.body;
            const permission = await this.taskService.grantPermission(taskId, ownerId, userId, canEdit === true || canEdit === 'true', canDelete === true || canDelete === 'true');
            return res.json(permission);
        }
        catch (err) {
            return res.status(err?.status ?? 500).json({ error: err?.message ?? 'Internal error' });
        }
    }
}
