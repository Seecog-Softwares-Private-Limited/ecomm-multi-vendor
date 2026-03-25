-- Explicit delivery scope: when false, seller is pan-India regardless of saved PIN rows.
SET @db := DATABASE();
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'sellers' AND COLUMN_NAME = 'restrict_delivery_to_pincodes'
);
SET @stmt := IF(@col_exists = 0,
  'ALTER TABLE `sellers` ADD COLUMN `restrict_delivery_to_pincodes` BOOLEAN NOT NULL DEFAULT FALSE',
  'SELECT 1');
PREPARE dyn FROM @stmt;
EXECUTE dyn;
DEALLOCATE PREPARE dyn;

-- Preserve behaviour for sellers who already configured PINs (only when column was just added or still default).
UPDATE `sellers` s
SET s.`restrict_delivery_to_pincodes` = TRUE
WHERE EXISTS (
  SELECT 1 FROM `seller_serviceable_pincodes` p WHERE p.`seller_id` = s.`id`
);
