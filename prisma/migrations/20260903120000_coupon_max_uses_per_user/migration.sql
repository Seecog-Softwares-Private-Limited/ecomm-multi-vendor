-- Add per-user coupon usage limit (null = unlimited per user; preserves existing coupons).
ALTER TABLE `coupons` ADD COLUMN `max_uses_per_user` INTEGER NULL;
