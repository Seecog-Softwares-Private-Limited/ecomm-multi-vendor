import { emailConfig } from "./config";
import { sendMail } from "./send";

const VERIFICATION_SUBJECT = "Verify your vendor account";

/**
 * Send vendor email verification with a link containing the token.
 * Does not throw; returns { sent, error } for the caller to handle.
 */
export async function sendVendorVerificationEmail(
  to: string,
  verificationToken: string
): Promise<{ sent: boolean; error?: string }> {
  const verifyUrl = `${emailConfig.appUrl}/vendor/verify?token=${encodeURIComponent(verificationToken)}`;
  const text = [
    "Verify your vendor account",
    "",
    "Click the link below to verify your email:",
    verifyUrl,
    "",
    "This link expires in 24 hours.",
    "If you did not create an account, you can ignore this email.",
  ].join("\n");

  return sendMail({
    to,
    subject: VERIFICATION_SUBJECT,
    text,
    html: [
      "<p>Verify your vendor account</p>",
      "<p>Click the link below to verify your email:</p>",
      `<p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
      "<p>This link expires in 24 hours.</p>",
      "<p>If you did not create an account, you can ignore this email.</p>",
    ].join(""),
  });
}
