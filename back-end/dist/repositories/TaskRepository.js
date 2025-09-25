import { PrismaClient } from '@prisma/client';
export class TaskRepository {
    constructor() {
        this.prisma = new PrismaClient();
    }
    async findAll() {
        // renvoie directement les objets (image/file sont des string | null si schema ok)
        return this.prisma.task.findMany({
            orderBy: [{ completed: 'asc' }, { createdAt: 'asc' }]
        });
    }
    async findById(id) {
        return this.prisma.task.findUnique({ where: { id } });
    }
    async create(data) {
        const created = await this.prisma.task.create({
            data: {
                title: data.title,
                description: data.description ?? null,
                completed: false,
                image: data.image ?? null, // string | null
                file: data.file ?? null, // string | null
                user: { connect: { id: data.userId } }
            }
        });
        return created;
    }
    async update(id, data) {
        const updated = await this.prisma.task.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.completed !== undefined && { completed: data.completed }),
                ...(data.image !== undefined && { image: data.image }), // string | null | undefined
                ...(data.file !== undefined && { file: data.file })
            }
        });
        return updated;
    }
    async delete(id) {
        await this.prisma.task.delete({ where: { id } });
    }
}
