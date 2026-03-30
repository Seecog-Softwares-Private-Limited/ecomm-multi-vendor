-- CreateTable
CREATE TABLE `career_openings` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `department` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `employment_type` VARCHAR(120) NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `career_openings_published_sort_order_idx`(`published`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
