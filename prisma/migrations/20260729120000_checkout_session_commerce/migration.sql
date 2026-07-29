-- Checkout session commerce architecture

ALTER TABLE `users` ADD COLUMN `cart_version` INT NOT NULL DEFAULT 0;

ALTER TABLE `cart_items` ADD COLUMN `saved_for_later` BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX `cart_items_user_id_saved_for_later_idx` ON `cart_items`(`user_id`, `saved_for_later`);

ALTER TABLE `orders` ADD COLUMN `checkout_session_id` CHAR(36) NULL;
ALTER TABLE `orders` ADD COLUMN `consumed_cart_item_ids` JSON NULL;
ALTER TABLE `orders` ADD COLUMN `idempotency_key` VARCHAR(64) NULL;
CREATE UNIQUE INDEX `orders_checkout_session_id_key` ON `orders`(`checkout_session_id`);
CREATE UNIQUE INDEX `orders_idempotency_key_key` ON `orders`(`idempotency_key`);

ALTER TABLE `payments` ADD COLUMN `idempotency_key` VARCHAR(64) NULL;
ALTER TABLE `payments` ADD COLUMN `razorpay_order_id` VARCHAR(255) NULL;
CREATE UNIQUE INDEX `payments_idempotency_key_key` ON `payments`(`idempotency_key`);
CREATE INDEX `payments_razorpay_order_id_idx` ON `payments`(`razorpay_order_id`);

CREATE TABLE `checkout_sessions` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `type` ENUM('CART', 'BUY_NOW', 'REORDER') NOT NULL,
    `status` ENUM('ACTIVE', 'CHECKING_OUT', 'COMPLETED', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `cart_version` INT NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `idempotency_key` VARCHAR(64) NULL,
    `price_confirmed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `checkout_sessions_idempotency_key_key`(`idempotency_key`),
    INDEX `checkout_sessions_user_id_idx`(`user_id`),
    INDEX `checkout_sessions_user_id_status_idx`(`user_id`, `status`),
    INDEX `checkout_sessions_expires_at_idx`(`expires_at`),
    INDEX `checkout_sessions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `checkout_session_lines` (
    `id` CHAR(36) NOT NULL,
    `checkout_session_id` CHAR(36) NOT NULL,
    `cart_item_id` CHAR(36) NULL,
    `product_id` CHAR(36) NOT NULL,
    `seller_id` CHAR(36) NOT NULL,
    `variant_key` VARCHAR(255) NULL,
    `quantity` INT NOT NULL,
    `unit_selling_price` DECIMAL(12, 2) NOT NULL,
    `unit_mrp` DECIMAL(12, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `checkout_session_lines_checkout_session_id_idx`(`checkout_session_id`),
    INDEX `checkout_session_lines_cart_item_id_idx`(`cart_item_id`),
    INDEX `checkout_session_lines_product_id_idx`(`product_id`),
    INDEX `checkout_session_lines_seller_id_idx`(`seller_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `stock_reservations` (
    `id` CHAR(36) NOT NULL,
    `checkout_session_id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NOT NULL,
    `product_variant_id` CHAR(36) NULL,
    `variant_key` VARCHAR(255) NULL,
    `quantity` INT NOT NULL,
    `status` ENUM('ACTIVE', 'RELEASED', 'CONSUMED') NOT NULL DEFAULT 'ACTIVE',
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `stock_reservations_checkout_session_id_idx`(`checkout_session_id`),
    INDEX `stock_reservations_product_id_idx`(`product_id`),
    INDEX `stock_reservations_status_expires_at_idx`(`status`, `expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `orders` ADD CONSTRAINT `orders_checkout_session_id_fkey` FOREIGN KEY (`checkout_session_id`) REFERENCES `checkout_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `checkout_sessions` ADD CONSTRAINT `checkout_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `checkout_session_lines` ADD CONSTRAINT `checkout_session_lines_checkout_session_id_fkey` FOREIGN KEY (`checkout_session_id`) REFERENCES `checkout_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `checkout_session_lines` ADD CONSTRAINT `checkout_session_lines_cart_item_id_fkey` FOREIGN KEY (`cart_item_id`) REFERENCES `cart_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `checkout_session_lines` ADD CONSTRAINT `checkout_session_lines_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `stock_reservations` ADD CONSTRAINT `stock_reservations_checkout_session_id_fkey` FOREIGN KEY (`checkout_session_id`) REFERENCES `checkout_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `stock_reservations` ADD CONSTRAINT `stock_reservations_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `stock_reservations` ADD CONSTRAINT `stock_reservations_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
