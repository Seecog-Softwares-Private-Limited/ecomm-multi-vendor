-- AlterTable: Add slug column to products (nullable, unique)
ALTER TABLE `products` ADD COLUMN `slug` VARCHAR(600) NULL;

-- CreateIndex: unique constraint on slug
CREATE UNIQUE INDEX `products_slug_key` ON `products`(`slug`);

-- CreateIndex: regular index for fast lookups
CREATE INDEX `products_slug_idx` ON `products`(`slug`);
