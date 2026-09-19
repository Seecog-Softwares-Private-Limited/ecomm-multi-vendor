-- Phase 1: Customer auth schema preparation (additive only).
-- - phone_verified / auth_onboarding_complete columns
-- - unique non-null phone
-- - unique (oauth_provider, oauth_provider_id)
-- password_hash is already nullable (20260430160000_user_oauth_fields).

-- 1) Additive columns (defaults false; phoneVerified not backfilled to true — no reliable OTP proof)
ALTER TABLE `users`
  ADD COLUMN `phone_verified` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `auth_onboarding_complete` BOOLEAN NOT NULL DEFAULT false;

-- 2) Existing active customers already use the app under prior onboarding rules.
--    Mark complete so a future gate does not strand them. Soft-deleted rows stay false.
UPDATE `users`
SET `auth_onboarding_complete` = true
WHERE `deleted_at` IS NULL;

-- 3) Soft-deleted rows share placeholder phone 9999999999 (10 rows, 0 active).
--    Null those phones so a unique phone index can be created without touching active users.
UPDATE `users`
SET `phone` = NULL
WHERE `deleted_at` IS NOT NULL
  AND `phone` = '9999999999';

-- 4) Replace non-unique phone index with unique (MySQL allows multiple NULLs)
DROP INDEX `users_phone_idx` ON `users`;
CREATE UNIQUE INDEX `users_phone_key` ON `users`(`phone`);

-- 5) Replace non-unique OAuth index with unique composite (MySQL allows multiple NULL pairs)
DROP INDEX `users_oauth_provider_oauth_provider_id_idx` ON `users`;
CREATE UNIQUE INDEX `users_oauth_provider_oauth_provider_id_key` ON `users`(`oauth_provider`, `oauth_provider_id`);
