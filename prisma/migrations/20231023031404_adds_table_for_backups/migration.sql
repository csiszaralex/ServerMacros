-- CreateTable
CREATE TABLE `backup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('FULL', 'PERSONAL') NOT NULL,
    `date` DATETIME(0) NOT NULL DEFAULT (curtime()),
    `file` VARCHAR(255) NOT NULL,
    `size` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
