import { emailConfig } from "./config";
import { sendMail } from "./send";

const RESET_SUBJECT = "Reset your Indovyapar password";

function buildCustomerPasswordResetHtml(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${RESET_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:28px 24px 8px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#111827;line-height:1.3;">Reset your password</p>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.55;color:#4b5563;">We received a request to reset the password for your <strong>Indovyapar</strong> customer account. Use the button below to choose a new password.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px 24px;text-align:center;">
              <a href="${resetUrl}" style="display:inline-block;background:#FF6A00;color:#ffffff !important;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;">Reset password</a>
              <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">This link expires in <strong style="color:#374151;">1 hour</strong>.</p>
              <p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">If you did not request this, ignore this email—your password will not change.</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">Indovyapar</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Customer (User) password reset email.
 */
export async function sendCustomerPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<{ sent: boolean; error?: string }> {
  const base = emailConfig.appUrl.replace(/\/+$/, "");
  const resetUrl = `${base}/reset-password?token=${encodeURIComponent(resetToken)}`;

  const text = [
    "Reset your Indovyapar password",
    "",
    "We received a request to reset your customer account password.",
    "",
    "Open this link in your browser (valid for 1 hour):",
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  return sendMail({
    to,
    subject: RESET_SUBJECT,
    text,
    html: buildCustomerPasswordResetHtml(resetUrl),
  });
}
