import nodemailer from "nodemailer";
import { emailConfig } from "./config";

export type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  if (!emailConfig.enabled) return null;
  try {
    transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.port === 465,
      auth:
        emailConfig.user && emailConfig.pass
          ? { user: emailConfig.user, pass: emailConfig.pass }
          : undefined,
    });
    return transporter;
  } catch (err) {
    console.error("[email] Failed to create transporter:", err);
    return null;
  }
}

/**
 * Send an email. If SMTP is not configured (e.g. in dev), logs the payload and resolves without error.
 */
export async function sendMail(options: SendMailOptions): Promise<{ sent: boolean; error?: string }> {
  const { to, subject, text, html } = options;
  const transport = getTransporter();

  if (!transport) {
    if (process.env.NODE_ENV === "development") {
      console.log("[email] (SMTP not configured) Would send:", { to, subject, text: text.slice(0, 80) + "..." });
    }
    return { sent: false };
  }

  try {
    await transport.sendMail({
      from: emailConfig.from,
      to,
      subject,
      text,
      html: html ?? text.replace(/\n/g, "<br>"),
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Send failed:", message);
    return { sent: false, error: message };
  }
}
