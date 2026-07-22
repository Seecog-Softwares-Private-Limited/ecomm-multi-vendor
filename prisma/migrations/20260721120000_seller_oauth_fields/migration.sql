-- Vendor Google/social sign-in: link OAuth provider on sellers table

ALTER TABLE `sellers`
  ADD COLUMN `oauth_provider` VARCHAR(50) NULL AFTER `password_reset_expires`,
  ADD COLUMN `oauth_provider_id` VARCHAR(255) NULL AFTER `oauth_provider`;

CREATE INDEX `sellers_oauth_idx` ON `sellers` (`oauth_provider`, `oauth_provider_id`);
