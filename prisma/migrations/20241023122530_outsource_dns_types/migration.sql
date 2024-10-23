-- AlterTable
ALTER TABLE `dns_domain` RENAME TO `dns_records`;


-- AlterTable
ALTER TABLE `dns_records` MODIFY `name` VARCHAR(64) NOT NULL,
    MODIFY `type` ENUM('A', 'AAAA', 'CNAME', 'MX') NOT NULL DEFAULT 'A',
    MODIFY `ip` VARCHAR(32) NOT NULL DEFAULT 'dynamic',
    MODIFY `proxy` BOOLEAN NOT NULL DEFAULT false;

-- RedefineIndex
CREATE UNIQUE INDEX `dns_records_name_key` ON `dns_records`(`name`);
DROP INDEX `dns_domain_name_key` ON `dns_records`;
