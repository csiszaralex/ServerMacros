/*
  Warnings:

  - You are about to drop the column `type` on the `backup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `backup` DROP COLUMN `type`;

-- CreateTable
CREATE TABLE `backup_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `cron` VARCHAR(255) NOT NULL,
    `keep_count` INTEGER NOT NULL DEFAULT 2,
    `dir` VARCHAR(255) NOT NULL,
    `exclude` VARCHAR(255) NOT NULL DEFAULT '',

    UNIQUE INDEX `backup_type_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `backup` ADD CONSTRAINT `backup_id_fkey` FOREIGN KEY (`id`) REFERENCES `backup_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
