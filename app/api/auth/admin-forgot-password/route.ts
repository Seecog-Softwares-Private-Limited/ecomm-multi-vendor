import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiValidationError,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  emailConfig,
  sendAdminPasswordResetEmail,
  type AdminPasswordResetPortal,
} from "@/lib/email";

const RESET_TOKEN_BYTES = 32;
const RESET_EXPIRY_HOURS = 1;

function validateBody(
  body: unknown
): { success: true; email: string; portal: AdminPasswordResetPortal } | { success: false; errors: Record<string, string> } {
  if (typeof body !== "object" || body === null) {
    return { success: false, errors: { email: "Body must be an object" } };
  }
  const o = body as Record<string, unknown>;
  const email = typeof o.email === "string" ? o.email.trim().toLowerCase() : "";
  const portalRaw = typeof o.portal === "string" ? o.portal.trim().toLowerCase() : "admin";
  const portal: AdminPasswordResetPortal = portalRaw === "superadmin" ? "superadmin" : "admin";

  if (!email) {
    return { success: false, errors: { email: "Email is required" } };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, errors: { email: "Invalid email format" } };
  }
  return { success: true, email, portal };
}

/**
 * POST /api/auth/admin-forgot-password — request password reset for an admin or super-admin.
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

  const { email, portal } = validation;

  const admin = await prisma.admin.findFirst({
    where: { email, deletedAt: null },
    select: { id: true, email: true },
  });

  let resetLink: string | undefined;
  if (admin) {
    const resetToken = randomBytes(RESET_TOKEN_BYTES).toString("hex");
    const resetExpires = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    const { sent, error } = await sendAdminPasswordResetEmail(admin.email, resetToken, portal);

    if (!sent) {
      console.error("[admin-forgot-password] Failed to send email:", error);
      if (emailConfig.enabled && process.env.NODE_ENV === "production") {
        return apiBadRequest("Failed to send reset email. Please try again later.");
      }
      if (process.env.NODE_ENV !== "production") {
        const base = emailConfig.appUrl.replace(/\/+$/, "");
        const resetPath =
          portal === "superadmin" ? "/superadmin/reset-password" : "/admin/reset-password";
        resetLink = `${base}${resetPath}?token=${encodeURIComponent(resetToken)}`;
      }
    }
  }

  return apiSuccess({
    message: "If an account exists with this email, you will receive a password reset link shortly.",
    ...(resetLink && { resetLink }),
  });
});
