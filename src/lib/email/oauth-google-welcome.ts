import { emailConfig } from "./config";
import { sendMail } from "./send";

const SUBJECT = "Welcome to Indovyapar! 🎉";

export type GoogleOAuthWelcomeEmailParams = {
  to: string;
  firstName?: string | null;
  lastName?: string | null;
  userId?: string;
};

function resolveDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string
): string {
  const full = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  if (full) return full;
  const local = email.split("@")[0]?.trim();
  return local || "there";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildWelcomeHtml(name: string, siteUrl: string): string {
  const safeName = escapeHtml(name);
  const visitUrl = siteUrl.replace(/\/+$/, "") || "https://www.indovyapar.com";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Welcome to Indovyapar</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f7fa;padding:40px 16px;">
<tr>
<td align="center">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

<tr>
<td style="background:linear-gradient(135deg,#1E5128 0%,#FF6A00 100%);padding:32px 24px;text-align:center;">
<p style="margin:0 0 8px;font-size:14px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.9);">Indovyapar</p>
<h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.3;font-weight:700;">
Welcome to Indovyapar!
</h1>
</td>
</tr>

<tr>
<td style="padding:32px 28px;">

<p style="margin:0 0 16px;font-size:16px;color:#333333;line-height:1.6;">
Hi <strong>${safeName}</strong>,
</p>

<p style="margin:0 0 16px;font-size:16px;color:#555555;line-height:1.8;">
Thank you for signing in with your Google account. Your Indovyapar account has been created successfully, and we're excited to have you with us.
</p>

<p style="margin:0 0 16px;font-size:16px;color:#555555;line-height:1.8;">
Shop from lakhs of products, enjoy secure checkout, and access your account safely from anywhere.
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding:24px 0 32px;">
<a href="${visitUrl}"
style="background:#FF6A00;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;display:inline-block;mso-padding-alt:0;">
<!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
<span style="mso-text-raise:15pt;">Visit Indovyapar</span>
<!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%">&nbsp;</i><![endif]-->
</a>
</td>
</tr>
</table>

<p style="margin:0 0 16px;font-size:16px;color:#555555;line-height:1.8;">
If you have any questions or need assistance, our support team is always ready to help.
</p>

<p style="margin:0;font-size:16px;color:#333333;line-height:1.6;">
Welcome aboard, and thank you for choosing Indovyapar.
</p>

<p style="margin:28px 0 0;font-size:16px;color:#333333;line-height:1.6;">
Best regards,<br>
<strong>Team Indovyapar</strong>
</p>

</td>
</tr>

<tr>
<td style="background:#f3f5f7;padding:20px 24px;text-align:center;font-size:13px;color:#777777;line-height:1.6;">
© ${new Date().getFullYear()} Indovyapar. All rights reserved.<br>
<a href="${visitUrl}" style="color:#FF6A00;text-decoration:none;">${visitUrl}</a>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;
}

function buildWelcomeText(name: string, siteUrl: string): string {
  const visitUrl = siteUrl.replace(/\/+$/, "") || "https://www.indovyapar.com";
  return [
    "Welcome to Indovyapar!",
    "",
    `Hi ${name},`,
    "",
    "Thank you for signing in with your Google account. Your Indovyapar account has been created successfully, and we're excited to have you with us.",
    "",
    "Shop from lakhs of products, enjoy secure checkout, and access your account safely from anywhere.",
    "",
    `Visit Indovyapar: ${visitUrl}`,
    "",
    "If you have any questions or need assistance, our support team is always ready to help.",
    "",
    "Welcome aboard, and thank you for choosing Indovyapar.",
    "",
    "Best regards,",
    "Team Indovyapar",
  ].join("\n");
}

/**
 * Sends the one-time Google OAuth welcome email (AWS SES via configured SMTP).
 */
export async function sendGoogleOAuthWelcomeEmail(
  params: GoogleOAuthWelcomeEmailParams
): Promise<{ sent: boolean; error?: string }> {
  const { to, firstName, lastName, userId } = params;
  const name = resolveDisplayName(firstName, lastName, to);
  const siteUrl = emailConfig.appUrl || "https://www.indovyapar.com";

  const logCtx = userId ? `userId=${userId} email=${to}` : `email=${to}`;
  console.log(`[email] Sending Google OAuth welcome email (${logCtx})`);

  const result = await sendMail({
    to,
    subject: SUBJECT,
    text: buildWelcomeText(name, siteUrl),
    html: buildWelcomeHtml(name, siteUrl),
  });

  if (result.sent) {
    console.log(`[email] Google OAuth welcome email sent (${logCtx})`);
  } else if (result.error) {
    console.error(`[email] Google OAuth welcome email failed (${logCtx}):`, result.error);
  } else {
    console.warn(`[email] Google OAuth welcome email not sent — SMTP disabled (${logCtx})`);
  }

  return result;
}

/**
 * Fire-and-forget wrapper — does not block the OAuth login redirect.
 */
export function queueGoogleOAuthWelcomeEmail(params: GoogleOAuthWelcomeEmailParams): void {
  const logCtx = params.userId
    ? `userId=${params.userId} email=${params.to}`
    : `email=${params.to}`;
  console.log(`[email] Queued Google OAuth welcome email (${logCtx})`);

  void sendGoogleOAuthWelcomeEmail(params).catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email] Google OAuth welcome email unexpected error (${logCtx}):`, message);
  });
}
