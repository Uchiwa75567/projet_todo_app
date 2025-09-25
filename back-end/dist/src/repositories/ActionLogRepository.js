import { prisma } from "../utils/prismaClient.js";
export const actionLogRepository = {
    async create(action, taskId, userId) {
        return prisma.actionLog.create({
            data: { action, taskId, userId },
            select: {
                id: true,
                action: true,
                timestamp: true,
                task: { select: { id: true, title: true } },
                user: { select: { id: true, name: true } },
            },
        });
    },
    async getAll() {
        return prisma.actionLog.findMany({
            select: {
                id: true,
                action: true,
                timestamp: true,
                task: { select: { id: true, title: true } },
                user: { select: { id: true, name: true } },
            },
            orderBy: { timestamp: "desc" },
        });
    }
};
