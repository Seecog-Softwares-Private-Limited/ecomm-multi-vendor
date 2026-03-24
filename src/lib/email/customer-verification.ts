import { emailConfig } from "./config";
import { sendMail } from "./send";

const SUBJECT = "Confirm your Indovyapar account";

/**
 * Customer signup confirmation — asks user to confirm they want to register.
 */
export async function sendCustomerVerificationEmail(
  to: string,
  verificationToken: string
): Promise<{ sent: boolean; error?: string }> {
  const verifyUrl = `${emailConfig.appUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(verificationToken)}`;
  const text = [
    "You're signing up for Indovyapar",
    "",
    "If you want to complete your registration, confirm your email by opening this link:",
    verifyUrl,
    "",
    "This link expires in 3 days.",
    "If you did not try to create an account, you can ignore this email.",
  ].join("\n");

  return sendMail({
    to,
    subject: SUBJECT,
    text,
    html: [
      "<p><strong>You're signing up for Indovyapar</strong></p>",
      "<p>If you want to complete your registration, confirm your email using the button or link below.</p>",
      `<p><a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#2563EB;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;">Confirm and finish sign-up</a></p>`,
      `<p style="word-break:break-all;font-size:13px;color:#64748B;">${verifyUrl}</p>`,
      "<p>This link expires in 3 days.</p>",
      "<p>If you did not try to create an account, you can ignore this email.</p>",
    ].join(""),
  });
}
