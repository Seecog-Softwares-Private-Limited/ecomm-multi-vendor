-- Add phone verification + OTP fields to sellers table
ALTER TABLE `sellers`
  ADD COLUMN `phone_verified`   TINYINT(1)    NOT NULL DEFAULT 0,
  ADD COLUMN `phone_otp_code`   VARCHAR(100)  NULL,
  ADD COLUMN `phone_otp_expires` DATETIME(3)  NULL,
  ADD COLUMN `email_otp_code`   VARCHAR(100)  NULL,
  ADD COLUMN `email_otp_expires` DATETIME(3)  NULL;
