import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiValidationError,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { emailConfig, sendCustomerPasswordResetEmail } from "@/lib/email";

const RESET_TOKEN_BYTES = 32;
const RESET_EXPIRY_HOURS = 1;

function validateBody(body: unknown): { success: true; email: string } | { success: false; errors: Record<string, string> } {
  if (typeof body !== "object" || body === null) {
    return { success: false, errors: { email: "Body must be an object" } };
  }
  const o = body as Record<string, unknown>;
  const email = typeof o.email === "string" ? o.email.trim().toLowerCase() : "";
  if (!email) {
    return { success: false, errors: { email: "Email is required" } };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, errors: { email: "Invalid email format" } };
  }
  return { success: true, email };
}

/**
 * POST /api/auth/forgot-password — request password reset for a customer (User).
 * If the email is registered, generates a reset token, saves it, and sends email.
 * Always returns the same success message when no validation error (no email enumeration).
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const validation = validateBody(body);
  if (!validation.success) {
    return apiValidationError("Validation failed", validation.errors);
  }

  const { email } = validation;

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true, email: true },
  });

  let resetLink: string | undefined;
  if (user) {
    const resetToken = randomBytes(RESET_TOKEN_BYTES).toString("hex");
    const resetExpires = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    const { sent, error } = await sendCustomerPasswordResetEmail(user.email, resetToken);

    if (!sent) {
      console.error("[forgot-password] Failed to send email:", error);
      if (emailConfig.enabled && process.env.NODE_ENV === "production") {
        return apiBadRequest(
          "We could not send the email. Check SMTP settings or try again later."
        );
      }
      if (process.env.NODE_ENV !== "production") {
        const base = emailConfig.appUrl.replace(/\/+$/, "");
        resetLink = `${base}/reset-password?token=${encodeURIComponent(resetToken)}`;
      }
    }
  }

  return apiSuccess({
    message: "If an account exists with this email, you will receive a password reset link shortly.",
    ...(resetLink && { resetLink }),
  });
});
