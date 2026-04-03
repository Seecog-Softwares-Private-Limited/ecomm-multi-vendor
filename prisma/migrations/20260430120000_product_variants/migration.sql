-- SKU-level product variants (color × size, per-variant price/stock)

CREATE TABLE `product_variants` (
    `id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NOT NULL,
    `color` VARCHAR(100) NULL,
    `size` VARCHAR(100) NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `sku` VARCHAR(100) NULL,
    `image` VARCHAR(500) NULL,
    `sort_order` INTEGER NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `product_variants_product_id_idx` ON `product_variants`(`product_id`);
CREATE INDEX `product_variants_deleted_at_idx` ON `product_variants`(`deleted_at`);

ALTER TABLE `product_variants`
ADD CONSTRAINT `product_variants_product_id_fkey`
FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
