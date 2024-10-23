-- AlterTable
ALTER TABLE `backup` RENAME TO `backups`;

-- AlterTable
ALTER TABLE `backups` ADD `available` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `backups` ADD `type_id` INTEGER NOT NULL;
ALTER TABLE `backups` DROP COLUMN `type`;

-- CreateTable
CREATE TABLE `backup_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `cron` VARCHAR(255) NOT NULL,
    `keep_count` INTEGER NOT NULL DEFAULT 2,
    `dir` VARCHAR(255) NOT NULL,
    `exclude` VARCHAR(255) NOT NULL DEFAULT '',
    `enabled` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `backup_types_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `backups` ADD CONSTRAINT `backups_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `backup_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
