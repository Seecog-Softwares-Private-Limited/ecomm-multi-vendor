-- AlterTable: Add email verification fields to sellers and new SellerStatus values
-- MySQL: Add new enum values and columns

-- Add new columns to sellers (nullable first for existing rows)
ALTER TABLE `sellers` ADD COLUMN `email_verified` TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `sellers` ADD COLUMN `verification_token` VARCHAR(255) NULL;
ALTER TABLE `sellers` ADD COLUMN `verification_token_expires` DATETIME(3) NULL;

-- Update default status for new vendors: use PENDING_VERIFICATION.
-- Existing rows keep their current status; ensure enum includes new values.
-- MySQL enum change: add new values to SellerStatus
ALTER TABLE `sellers` MODIFY COLUMN `status` ENUM('PENDING_VERIFICATION', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING_VERIFICATION';
