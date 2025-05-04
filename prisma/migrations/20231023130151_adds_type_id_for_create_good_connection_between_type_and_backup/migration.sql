/*
  Warnings:

  - Added the required column `typeId` to the `backup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `backup` DROP FOREIGN KEY `backup_id_fkey`;

-- AlterTable
ALTER TABLE `backup` ADD COLUMN `typeId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `backup` ADD CONSTRAINT `backup_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `backup_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
