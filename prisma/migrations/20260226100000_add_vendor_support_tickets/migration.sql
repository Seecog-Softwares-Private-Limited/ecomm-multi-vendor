-- CreateTable
CREATE TABLE `vendor_support_tickets` (
    `id` CHAR(36) NOT NULL,
    `seller_id` CHAR(36) NOT NULL,
    `subject` VARCHAR(500) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `vendor_support_tickets_seller_id_idx`(`seller_id`),
    INDEX `vendor_support_tickets_status_idx`(`status`),
    INDEX `vendor_support_tickets_created_at_idx`(`created_at`),
    INDEX `vendor_support_tickets_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `vendor_support_tickets` ADD CONSTRAINT `vendor_support_tickets_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
