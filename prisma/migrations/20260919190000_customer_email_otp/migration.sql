-- Customer email OTP for registration / phone-first email verification (additive).
CREATE TABLE `customer_email_otps` (
    `id` CHAR(36) NOT NULL,
    `email_norm` VARCHAR(255) NOT NULL,
    `code_hash` VARCHAR(128) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `attempt_count` INTEGER NOT NULL DEFAULT 0,
    `consumed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `customer_email_otps_email_norm_expires_at_idx` ON `customer_email_otps`(`email_norm`, `expires_at`);
