/*
  Warnings:

  - You are about to alter the column `file` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `LongBlob` to `VarChar(191)`.
  - You are about to alter the column `image` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `LongBlob` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Task` MODIFY `file` VARCHAR(191) NULL,
    MODIFY `image` VARCHAR(191) NULL;
