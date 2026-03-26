-- Customer email verification (aligns `users` with Prisma `User.emailVerified` + token fields).
-- Existing rows default to verified so current logins keep working.

ALTER TABLE `users` ADD COLUMN `email_verified` TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE `users` ADD COLUMN `verification_token` VARCHAR(64) NULL;
ALTER TABLE `users` ADD COLUMN `verification_token_expires` DATETIME(3) NULL;
