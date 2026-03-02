-- AlterTable: add status_reason and primary_category_id to sellers; add ON_HOLD to SellerStatus
ALTER TABLE `sellers` ADD COLUMN `status_reason` TEXT NULL;
ALTER TABLE `sellers` ADD COLUMN `primary_category_id` CHAR(36) NULL;
ALTER TABLE `sellers` MODIFY COLUMN `status` ENUM('PENDING_VERIFICATION', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ON_HOLD') NOT NULL DEFAULT 'PENDING_VERIFICATION';
ALTER TABLE `sellers` ADD CONSTRAINT `sellers_primary_category_id_fkey` FOREIGN KEY (`primary_category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX `sellers_primary_category_id_idx` ON `sellers`(`primary_category_id`);

-- CreateTable: category_document_requirements
CREATE TABLE `category_document_requirements` (
    `id` CHAR(36) NOT NULL,
    `category_id` CHAR(36) NOT NULL,
    `document_name` VARCHAR(255) NOT NULL,
    `is_required` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    PRIMARY KEY (`id`),
    INDEX `category_document_requirements_category_id_idx`(`category_id`),
    INDEX `category_document_requirements_deleted_at_idx`(`deleted_at`),
    CONSTRAINT `category_document_requirements_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: vendor_documents
CREATE TABLE `vendor_documents` (
    `id` CHAR(36) NOT NULL,
    `seller_id` CHAR(36) NOT NULL,
    `document_name` VARCHAR(255) NOT NULL,
    `document_url` VARCHAR(500) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    UNIQUE INDEX `vendor_documents_seller_id_document_name_key`(`seller_id`, `document_name`),
    INDEX `vendor_documents_seller_id_idx`(`seller_id`),
    INDEX `vendor_documents_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`),
    CONSTRAINT `vendor_documents_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
