import { emailConfig } from "./config";
import { sendMail } from "./send";

/**
 * Email a vendor when their account is approved.
 * Does not throw; returns { sent, error }.
 */
export async function sendVendorApprovalEmail(
  to: string,
  vendorName: string
): Promise<{ sent: boolean; error?: string }> {
  const dashboardUrl = `${emailConfig.appUrl}/vendor`;
  const name = vendorName.trim() || "Vendor";
  const subject = "Your IndoVyapar vendor account is approved";

  const text = [
    `Hi ${name},`,
    "",
    "Great news — your vendor account has been approved.",
    "You can now list products and start selling on IndoVyapar.",
    "",
    `Open your dashboard: ${dashboardUrl}`,
    "",
    "— IndoVyapar",
  ].join("\n");

  return sendMail({
    to,
    subject,
    text,
    html: [
      `<p>Hi ${escapeHtml(name)},</p>`,
      "<p>Great news — your vendor account has been approved.</p>",
      "<p>You can now list products and start selling on IndoVyapar.</p>",
      `<p><a href="${dashboardUrl}">Open your vendor dashboard</a></p>`,
      "<p>— IndoVyapar</p>",
    ].join(""),
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
