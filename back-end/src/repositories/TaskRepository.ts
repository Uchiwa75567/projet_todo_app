import prisma from '../utils/prismaClient.js';
import { type IRepository } from './Irepository.js';
import { type Task, type CreateTaskDTO, type UpdateTaskDTO } from '../types/task.types.js';

export class TaskRepository implements IRepository<Task> {

  async findAll(): Promise<Task[]> {
    // renvoie directement les objets (image/file sont des string | null si schema ok)
    return prisma.task.findMany({
      orderBy: [{ completed: 'asc' }, { createdAt: 'asc' }]
    });
  }

  async findAllPaginated(page: number = 1, limit: number = 5): Promise<{ data: Task[], total: number, totalPages: number, currentPage: number }> {
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

  async findById(id: number): Promise<Task | null> {
    return prisma.task.findUnique({ where: { id } });
  }

  async create(data: CreateTaskDTO & { userId: number }): Promise<Task> {
    const created = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        completed: false,
        image: data.image ?? null, // string | null
        file: data.file ?? null,   // string | null
        voice: data.voice ?? null,  // string | null
        user: { connect: { id: data.userId } }
      }
    });
    return created;
  }

  async update(id: number, data: UpdateTaskDTO): Promise<Task> {
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

  async delete(id: number): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }

  // Trouver les tâches qui commencent aujourd'hui
  async findTasksStartingToday(date: Date): Promise<Task[]> {
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
  async findExpiredTasks(date: Date): Promise<Task[]> {
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
