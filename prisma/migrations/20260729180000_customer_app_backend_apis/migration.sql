-- Customer app backend: FAQs, support messages, review votes, notification prefs, notification metadata

ALTER TABLE `notifications` ADD COLUMN `metadata` JSON NULL;

CREATE TABLE `support_ticket_messages` (
    `id` CHAR(36) NOT NULL,
    `ticket_id` CHAR(36) NOT NULL,
    `author_type` ENUM('CUSTOMER', 'ADMIN') NOT NULL,
    `body` TEXT NOT NULL,
    `user_id` CHAR(36) NULL,
    `admin_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `support_ticket_messages_ticket_id_created_at_idx`(`ticket_id`, `created_at`),
    INDEX `support_ticket_messages_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `review_helpful_votes` (
    `id` CHAR(36) NOT NULL,
    `review_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `review_helpful_votes_review_id_idx`(`review_id`),
    INDEX `review_helpful_votes_user_id_idx`(`user_id`),
    UNIQUE INDEX `review_helpful_votes_review_id_user_id_key`(`review_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `faqs` (
    `id` VARCHAR(80) NOT NULL,
    `category` VARCHAR(80) NOT NULL,
    `question` VARCHAR(500) NOT NULL,
    `answer` TEXT NOT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `faqs_category_idx`(`category`),
    INDEX `faqs_display_order_idx`(`display_order`),
    INDEX `faqs_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `notification_preferences` (
    `user_id` CHAR(36) NOT NULL,
    `order_updates` BOOLEAN NOT NULL DEFAULT true,
    `payments` BOOLEAN NOT NULL DEFAULT true,
    `offers` BOOLEAN NOT NULL DEFAULT true,
    `wishlist` BOOLEAN NOT NULL DEFAULT true,
    `security` BOOLEAN NOT NULL DEFAULT true,
    `email` BOOLEAN NOT NULL DEFAULT true,
    `sms` BOOLEAN NOT NULL DEFAULT true,
    `push` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `support_ticket_messages` ADD CONSTRAINT `support_ticket_messages_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `support_ticket_messages` ADD CONSTRAINT `support_ticket_messages_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `support_ticket_messages` ADD CONSTRAINT `support_ticket_messages_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `review_helpful_votes` ADD CONSTRAINT `review_helpful_votes_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `review_helpful_votes` ADD CONSTRAINT `review_helpful_votes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
