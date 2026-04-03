-- Add multi-image JSON column to product_variants
ALTER TABLE `product_variants` ADD COLUMN `images` JSON NULL;
