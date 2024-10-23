/*
  Warnings:

  - A unique constraint covering the columns `[record_id]` on the table `dns_records` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `record_id` to the `dns_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zone_id` to the `dns_records` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dns_records` ADD COLUMN `record_id` VARCHAR(32) NOT NULL,
    ADD COLUMN `zone_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `dns_zones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(32) NOT NULL,
    `zone_id` VARCHAR(32) NOT NULL,

    UNIQUE INDEX `dns_zones_name_key`(`name`),
    UNIQUE INDEX `dns_zones_zone_id_key`(`zone_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `dns_records_record_id_key` ON `dns_records`(`record_id`);

-- AddForeignKey
ALTER TABLE `dns_records` ADD CONSTRAINT `dns_records_zone_id_fkey` FOREIGN KEY (`zone_id`) REFERENCES `dns_zones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
