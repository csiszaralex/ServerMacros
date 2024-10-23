/*
  Warnings:

  - A unique constraint covering the columns `[name,type]` on the table `dns_records` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `dns_records_name_key` ON `dns_records`;

-- CreateIndex
CREATE UNIQUE INDEX `dns_records_name_type_key` ON `dns_records`(`name`, `type`);
