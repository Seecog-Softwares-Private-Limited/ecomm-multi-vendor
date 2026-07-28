import { emailConfig } from "./config";
import { sendMail } from "./send";

export type AdminPasswordResetPortal = "admin" | "superadmin";

const SUBJECTS: Record<AdminPasswordResetPortal, string> = {
  admin: "Reset your Admin panel password",
  superadmin: "Reset your Super Admin password",
};

function buildAdminPasswordResetHtml(resetUrl: string, portal: AdminPasswordResetPortal): string {
  const title =
    portal === "superadmin" ? "Reset your Super Admin password" : "Reset your Admin panel password";
  const panel =
    portal === "superadmin" ? "Super Admin Control Center" : "Admin panel";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:28px 24px 8px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#111827;line-height:1.3;">${title}</p>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.55;color:#4b5563;">We received a request to set a new password for your <strong>Indovyapar</strong> ${panel} account. Use the button below to choose a new password.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px 24px;text-align:center;">
              <a href="${resetUrl}" style="display:inline-block;background:#FF6A00;color:#ffffff !important;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;">Reset password</a>
              <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">This secure link expires in <strong style="color:#374151;">1 hour</strong>.</p>
              <p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">If you did not request a password reset, you can ignore this email—your password will stay the same.</p>
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
 * Send admin / super-admin password reset email with a link containing the token.
 */
export async function sendAdminPasswordResetEmail(
  to: string,
  resetToken: string,
  portal: AdminPasswordResetPortal = "admin"
): Promise<{ sent: boolean; error?: string }> {
  const base = emailConfig.appUrl.replace(/\/+$/, "");
  const resetPath =
    portal === "superadmin" ? "/superadmin/reset-password" : "/admin/reset-password";
  const resetUrl = `${base}${resetPath}?token=${encodeURIComponent(resetToken)}`;
  const subject = SUBJECTS[portal];
  const panelLabel = portal === "superadmin" ? "Super Admin" : "Admin panel";

  const text = [
    subject,
    "",
    `We received a request to set a new password for your Indovyapar ${panelLabel} account.`,
    "",
    "Open this link in your browser (valid for 1 hour):",
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  return sendMail({
    to,
    subject,
    text,
    html: buildAdminPasswordResetHtml(resetUrl, portal),
  });
}
