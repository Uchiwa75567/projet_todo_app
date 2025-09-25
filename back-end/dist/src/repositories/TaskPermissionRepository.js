import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class TaskPermissionRepository {
    async grantPermission(taskId, userId, canEdit, canDelete) {
        return prisma.taskPermission.upsert({
            where: { taskId_userId: { taskId, userId } },
            update: { canEdit, canDelete },
            create: { taskId, userId, canEdit, canDelete }
        });
    }
    async userCanEdit(taskId, userId) {
        const permission = await prisma.taskPermission.findUnique({
            where: { taskId_userId: { taskId, userId } }
        });
        return permission?.canEdit ?? false;
    }
    async userCanDelete(taskId, userId) {
        const permission = await prisma.taskPermission.findUnique({
            where: { taskId_userId: { taskId, userId } }
        });
        return permission?.canDelete ?? false;
    }
    async deleteByTaskId(taskId) {
        await prisma.taskPermission.deleteMany({
            where: { taskId }
        });
    }
}
