import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class TaskPermissionRepository {
  async grantPermission(taskId: number, userId: number, canEdit: boolean, canDelete: boolean) {
    return prisma.taskPermission.upsert({
      where: { taskId_userId: { taskId, userId } },
      update: { canEdit, canDelete },
      create: { taskId, userId, canEdit, canDelete }
    });
  }

  async userCanEdit(taskId: number, userId: number): Promise<boolean> {
    const permission = await prisma.taskPermission.findUnique({
      where: { taskId_userId: { taskId, userId } }
    });
    return permission?.canEdit ?? false;
  }

  async userCanDelete(taskId: number, userId: number): Promise<boolean> {
    const permission = await prisma.taskPermission.findUnique({
      where: { taskId_userId: { taskId, userId } }
    });
    return permission?.canDelete ?? false;
  }
  async deleteByTaskId(taskId: number): Promise<void> {
  await prisma.taskPermission.deleteMany({
    where: { taskId }
  });
}

}
