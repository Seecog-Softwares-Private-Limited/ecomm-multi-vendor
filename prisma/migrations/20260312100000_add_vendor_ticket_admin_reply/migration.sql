-- AlterTable
ALTER TABLE `vendor_support_tickets` ADD COLUMN `admin_reply` TEXT NULL,
    ADD COLUMN `admin_replied_at` DATETIME(3) NULL;
