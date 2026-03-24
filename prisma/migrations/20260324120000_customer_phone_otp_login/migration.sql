-- CreateTable
CREATE TABLE IF NOT EXISTS `customer_phone_otps` (
    `id` CHAR(36) NOT NULL,
    `phone_norm` VARCHAR(20) NOT NULL,
    `code_hash` VARCHAR(128) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `attempt_count` INTEGER NOT NULL DEFAULT 0,
    `consumed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `customer_phone_otps_phone_norm_expires_at_idx`(`phone_norm`, `expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Non-unique index on phone for lookups (legacy DBs may have duplicate phones)
CREATE INDEX `users_phone_idx` ON `users`(`phone`);
