-- One-time bulk update: every catalog product sells for ₹1 (MRP and selling price).
-- Variant rows (color/size SKUs) get ₹1 as well so listing UIs stay consistent.

UPDATE `products`
SET
  `selling_price` = 1.00,
  `mrp` = 1.00;

UPDATE `product_variants`
SET
  `price` = 1.00;
