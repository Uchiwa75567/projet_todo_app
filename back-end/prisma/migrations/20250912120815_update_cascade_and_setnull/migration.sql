-- DropForeignKey
ALTER TABLE `ActionLog` DROP FOREIGN KEY `ActionLog_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `TaskPermission` DROP FOREIGN KEY `TaskPermission_taskId_fkey`;

-- DropIndex
DROP INDEX `ActionLog_taskId_fkey` ON `ActionLog`;

-- AlterTable
ALTER TABLE `ActionLog` MODIFY `taskId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TaskPermission` ADD CONSTRAINT `TaskPermission_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActionLog` ADD CONSTRAINT `ActionLog_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
