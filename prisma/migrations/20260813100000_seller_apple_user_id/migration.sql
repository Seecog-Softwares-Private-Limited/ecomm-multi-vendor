-- Sign in with Apple: store Apple `sub` separately from Google oauth_* columns
-- so a Vendor can keep Google login after linking Apple.

ALTER TABLE `sellers`
  ADD COLUMN `apple_user_id` VARCHAR(255) NULL AFTER `oauth_provider_id`;

CREATE UNIQUE INDEX `sellers_apple_user_id_key` ON `sellers`(`apple_user_id`);
