-- Admin reply fields on customer support_tickets (mirror vendor_support_tickets).
-- Idempotent: safe if columns already exist (avoids 1060 Duplicate column on re-deploy / drifted DB).

SET @db := DATABASE();

-- admin_reply
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'support_tickets' AND COLUMN_NAME = 'admin_reply'
);
SET @stmt := IF(@col_exists = 0,
  'ALTER TABLE `support_tickets` ADD COLUMN `admin_reply` TEXT NULL',
  'SELECT 1');
PREPARE dyn FROM @stmt;
EXECUTE dyn;
DEALLOCATE PREPARE dyn;

-- admin_replied_at
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'support_tickets' AND COLUMN_NAME = 'admin_replied_at'
);
SET @stmt := IF(@col_exists = 0,
  'ALTER TABLE `support_tickets` ADD COLUMN `admin_replied_at` DATETIME(3) NULL',
  'SELECT 1');
PREPARE dyn FROM @stmt;
EXECUTE dyn;
DEALLOCATE PREPARE dyn;
