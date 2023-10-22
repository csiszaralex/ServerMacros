-- CreateTable
CREATE TABLE `dns_domain` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `type` VARCHAR(8) NOT NULL DEFAULT 'A',
    `ip` VARCHAR(20) NOT NULL DEFAULT 'dinamic',
    `proxy` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ips` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `IP` VARCHAR(20) NOT NULL,
    `ChangeDate` DATETIME(0) NOT NULL DEFAULT (curtime()),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
