import prisma from '../utils/prismaClient.js';
export class TaskRepository {
    async findAll() {
        // renvoie directement les objets (image/file sont des string | null si schema ok)
        return prisma.task.findMany({
            orderBy: [{ completed: 'asc' }, { createdAt: 'asc' }]
        });
    }
    async findAllPaginated(page = 1, limit = 5) {
        const skip = (page - 1) * limit;
        // Récupérer le total des tâches
        const total = await prisma.task.count();
        // Récupérer les tâches paginées
        const data = await prisma.task.findMany({
            skip,
            take: limit,
            orderBy: [{ completed: 'asc' }, { createdAt: 'asc' }]
        });
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            total,
            totalPages,
            currentPage: page
        };
    }
    async findById(id) {
        return prisma.task.findUnique({ where: { id } });
    }
    async create(data) {
        const created = await prisma.task.create({
            data: {
                title: data.title,
                description: data.description ?? null,
                completed: false,
                image: data.image ?? null, // string | null
                file: data.file ?? null, // string | null
                voice: data.voice ?? null, // string | null
                user: { connect: { id: data.userId } }
            }
        });
        return created;
    }
    async update(id, data) {
        const updated = await prisma.task.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.completed !== undefined && { completed: data.completed }),
                ...(data.image !== undefined && { image: data.image }), // string | null | undefined
                ...(data.file !== undefined && { file: data.file }),
                ...(data.voice !== undefined && { voice: data.voice })
            }
        });
        return updated;
    }
    async delete(id) {
        await prisma.task.delete({ where: { id } });
    }
    // Trouver les tâches qui commencent aujourd'hui
    async findTasksStartingToday(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return prisma.task.findMany({
            where: {
                startDate: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                completed: false
            }
        });
    }
    // Trouver les tâches expirées (endDate dépassée et non terminées)
    async findExpiredTasks(date) {
        return prisma.task.findMany({
            where: {
                endDate: {
                    lt: date
                },
                completed: false
            }
        });
    }
}
