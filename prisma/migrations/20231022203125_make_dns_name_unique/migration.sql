/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `dns_domain` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `dns_domain_name_key` ON `dns_domain`(`name`);
