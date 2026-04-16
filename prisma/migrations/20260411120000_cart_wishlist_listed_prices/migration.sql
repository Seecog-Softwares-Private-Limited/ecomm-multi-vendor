-- AlterTable
ALTER TABLE `cart_items` ADD COLUMN `listed_unit_selling_price` DECIMAL(12, 2) NULL,
    ADD COLUMN `listed_unit_mrp` DECIMAL(12, 2) NULL;

-- AlterTable
ALTER TABLE `wishlist_items` ADD COLUMN `listed_selling_price` DECIMAL(12, 2) NULL,
    ADD COLUMN `listed_mrp` DECIMAL(12, 2) NULL;
