-- AlterTable: customer password reset (forgot password)
ALTER TABLE `users` ADD COLUMN `password_reset_token` VARCHAR(255) NULL,
    ADD COLUMN `password_reset_expires` DATETIME(3) NULL;
