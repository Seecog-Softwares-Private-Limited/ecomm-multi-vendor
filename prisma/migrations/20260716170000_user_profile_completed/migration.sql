-- Track whether the customer finished the required post-login profile step (mobile number).
ALTER TABLE `users`
  ADD COLUMN `profile_completed` BOOLEAN NOT NULL DEFAULT false;

-- Existing accounts that already have a phone are treated as complete.
UPDATE `users`
SET `profile_completed` = true
WHERE `phone` IS NOT NULL AND TRIM(`phone`) <> '';
