-- Migration: add OAuth social login fields to users table
-- Makes password_hash nullable (OAuth-only users have no password)
-- Adds oauth_provider, oauth_provider_id, avatar_url columns

ALTER TABLE `users`
  MODIFY COLUMN `password_hash` VARCHAR(255) NULL,
  ADD COLUMN `avatar_url` VARCHAR(500) NULL AFTER `phone`,
  ADD COLUMN `oauth_provider` VARCHAR(50) NULL AFTER `password_reset_expires`,
  ADD COLUMN `oauth_provider_id` VARCHAR(255) NULL AFTER `oauth_provider`;

CREATE INDEX `users_oauth_idx` ON `users` (`oauth_provider`, `oauth_provider_id`);
