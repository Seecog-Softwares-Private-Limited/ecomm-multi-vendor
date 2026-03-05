import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiValidationError,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { emailConfig, sendVendorPasswordResetEmail } from "@/lib/email";

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
 * POST /api/auth/vendor-forgot-password — request password reset for a vendor.
 * If the email is registered, generates a reset token, saves it, and sends the reset link by email.
 * Always returns success to avoid email enumeration.
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

  const seller = await prisma.seller.findFirst({
    where: { email, deletedAt: null },
    select: { id: true, email: true },
  });

  let resetLink: string | undefined;
  if (seller) {
    const resetToken = randomBytes(RESET_TOKEN_BYTES).toString("hex");
    const resetExpires = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.seller.update({
      where: { id: seller.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    const { sent, error } = await sendVendorPasswordResetEmail(seller.email, resetToken);

    if (!sent) {
      console.error("[vendor-forgot-password] Failed to send email:", error);
      // In production with SMTP enabled, fail the request so the user knows email did not go out
      if (emailConfig.enabled && process.env.NODE_ENV === "production") {
        return apiBadRequest("Failed to send reset email. Please try again later.");
      }
      // In development, always return the reset link so you can test without SMTP
      if (process.env.NODE_ENV !== "production") {
        resetLink = `${emailConfig.appUrl}/vendor/reset-password?token=${encodeURIComponent(resetToken)}`;
      }
    }
  }

  return apiSuccess({
    message: "If an account exists with this email, you will receive a password reset link shortly.",
    ...(resetLink && { resetLink }),
  });
});
