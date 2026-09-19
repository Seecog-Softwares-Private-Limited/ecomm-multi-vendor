-- Phase 1: Vendor/Seller auth schema (additive + safe).
-- - password_hash nullable (phone/Google/Apple — no synthetic passwords)
-- - auth_onboarding_complete column
-- - unique (oauth_provider, oauth_provider_id)
-- NOTE: phone UNIQUE is NOT added — legitimate active duplicate phones exist
--       (normalized last-10 collisions across APPROVED sellers). Enforce in app.

-- 1) Nullable password hash
ALTER TABLE `sellers`
  MODIFY COLUMN `password_hash` VARCHAR(255) NULL;

-- 2) Auth onboarding flag (separate from KYC / admin approval)
ALTER TABLE `sellers`
  ADD COLUMN `auth_onboarding_complete` BOOLEAN NOT NULL DEFAULT false;

-- 3) Existing active sellers remain operational under prior rules
UPDATE `sellers`
SET `auth_onboarding_complete` = true
WHERE `deleted_at` IS NULL;

-- 4) Do NOT backfill phone_verified=true (no reliable OTP proof for most rows)

-- 5) Unique Google provider identity (MySQL allows multiple NULL pairs).
--    Historical index name from 20260721120000_seller_oauth_fields is sellers_oauth_idx.
DROP INDEX `sellers_oauth_idx` ON `sellers`;
CREATE UNIQUE INDEX `sellers_oauth_provider_oauth_provider_id_key`
  ON `sellers`(`oauth_provider`, `oauth_provider_id`);
