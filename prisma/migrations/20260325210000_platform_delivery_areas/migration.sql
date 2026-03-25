-- Platform-wide delivery PIN list (replaces per-seller catalog filtering when restrict is enabled).

CREATE TABLE `platform_delivery_config` (
    `id` VARCHAR(36) NOT NULL,
    `restrict_delivery_to_pincodes` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `platform_delivery_config` (`id`, `restrict_delivery_to_pincodes`, `created_at`, `updated_at`)
VALUES ('default', false, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

CREATE TABLE `platform_serviceable_pincodes` (
    `id` CHAR(36) NOT NULL,
    `pincode` VARCHAR(10) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `platform_serviceable_pincodes_pincode_key`(`pincode`),
    INDEX `platform_serviceable_pincodes_pincode_idx`(`pincode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
