-- Admin-managed storefront banners (additive).
CREATE TABLE `banners` (
    `id` CHAR(36) NOT NULL,
    `placement` ENUM('HERO', 'PROMO') NOT NULL,
    `image_url` VARCHAR(1024) NOT NULL,
    `title` VARCHAR(120) NULL,
    `subtitle` VARCHAR(255) NULL,
    `cta_text` VARCHAR(40) NULL,
    `link_url` VARCHAR(1024) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `banners_placement_is_active_sort_order_idx`(`placement`, `is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kids' Footwear under Footwear; does nothing if the category is absent or the row already exists.
INSERT IGNORE INTO `sub_categories` (`id`, `category_id`, `slug`, `name`, `sort_order`, `created_at`, `updated_at`)
SELECT UUID(), `id`, 'kids-shoes', 'Kids'' Footwear', 4, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `categories` WHERE `slug` = 'footwear';
