-- Optional per-seller PIN list. Empty = pan-India (all products shown for any PIN).
CREATE TABLE `seller_serviceable_pincodes` (
    `id` CHAR(36) NOT NULL,
    `seller_id` CHAR(36) NOT NULL,
    `pincode` VARCHAR(10) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `seller_serviceable_pincodes_seller_id_idx`(`seller_id`),
    INDEX `seller_serviceable_pincodes_pincode_idx`(`pincode`),
    UNIQUE INDEX `seller_serviceable_pincodes_seller_id_pincode_key`(`seller_id`, `pincode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `seller_serviceable_pincodes` ADD CONSTRAINT `seller_serviceable_pincodes_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
