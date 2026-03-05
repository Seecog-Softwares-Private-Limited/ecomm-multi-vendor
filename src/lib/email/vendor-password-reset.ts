import { emailConfig } from "./config";
import { sendMail } from "./send";

const RESET_SUBJECT = "Reset your Vendor Center password";

/**
 * Send vendor password reset email with a link containing the token.
 * Does not throw; returns { sent, error } for the caller to handle.
 */
export async function sendVendorPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<{ sent: boolean; error?: string }> {
  const resetUrl = `${emailConfig.appUrl}/vendor/reset-password?token=${encodeURIComponent(resetToken)}`;
  const text = [
    "Reset your Vendor Center password",
    "",
    "Click the link below to set a new password:",
    resetUrl,
    "",
    "This link expires in 1 hour.",
    "If you did not request a password reset, you can ignore this email.",
  ].join("\n");

  return sendMail({
    to,
    subject: RESET_SUBJECT,
    text,
    html: [
      "<p>Reset your Vendor Center password</p>",
      "<p>Click the link below to set a new password:</p>",
      `<p><a href="${resetUrl}">${resetUrl}</a></p>`,
      "<p>This link expires in 1 hour.</p>",
      "<p>If you did not request a password reset, you can ignore this email.</p>",
    ].join(""),
  });
}
