-- AlterTable
ALTER TABLE `sellers` ADD COLUMN `password_reset_token` VARCHAR(255) NULL,
    ADD COLUMN `password_reset_expires` DATETIME(3) NULL;
