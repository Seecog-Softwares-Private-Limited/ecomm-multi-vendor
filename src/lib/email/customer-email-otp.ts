import { emailConfig } from "./config";
import { sendMail } from "./send";

const SUBJECT = "Your IndoVyapar verification code";

/**
 * Send a 6-digit Customer email OTP. Never log the code.
 */
export async function sendCustomerEmailOtpEmail(
  to: string,
  otp: string
): Promise<{ sent: boolean; error?: string }> {
  const text = [
    `Your IndoVyapar verification code is: ${otp}`,
    "",
    "This code expires in 5 minutes.",
    "If you did not request this code, you can ignore this email.",
  ].join("\n");

  return sendMail({
    to,
    subject: SUBJECT,
    text,
    html: [
      `<p><strong>Your IndoVyapar verification code is: ${otp}</strong></p>`,
      "<p>This code expires in 5 minutes.</p>",
      "<p>If you did not request this code, you can ignore this email.</p>",
      `<p style="font-size:12px;color:#64748B;">${emailConfig.appUrl}</p>`,
    ].join(""),
  });
}
