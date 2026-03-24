-- CreateTable
CREATE TABLE `cms_footer_pages` (
    `id` CHAR(36) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `section_id` VARCHAR(80) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cms_footer_pages_slug_key`(`slug`),
    INDEX `cms_footer_pages_section_id_idx`(`section_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
