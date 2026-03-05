import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiValidationError,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

function validateBody(
  body: unknown
): { success: true; token: string; newPassword: string } | { success: false; errors: Record<string, string> } {
  if (typeof body !== "object" || body === null) {
    return { success: false, errors: { form: "Body must be an object" } };
  }
  const o = body as Record<string, unknown>;
  const token = typeof o.token === "string" ? o.token.trim() : "";
  const newPassword = typeof o.newPassword === "string" ? o.newPassword : "";
  const errors: Record<string, string> = {};
  if (!token) errors.token = "Reset token is required";
  if (!newPassword) {
    errors.newPassword = "New password is required";
  } else if (newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters";
  }
  if (Object.keys(errors).length) {
    return { success: false, errors };
  }
  return { success: true, token, newPassword };
}

/**
 * POST /api/auth/vendor-reset-password — set new password using reset token.
 * Token must match and not be expired. Clears reset token after success.
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

  const { token, newPassword } = validation;

  const seller = await prisma.seller.findFirst({
    where: {
      passwordResetToken: token,
      deletedAt: null,
    },
    select: {
      id: true,
      passwordResetExpires: true,
    },
  });

  if (!seller) {
    return apiValidationError("Invalid or expired reset link", { token: "Please request a new password reset." });
  }

  if (!seller.passwordResetExpires || seller.passwordResetExpires < new Date()) {
    return apiValidationError("Reset link has expired", { token: "Please request a new password reset." });
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.seller.update({
    where: { id: seller.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return apiSuccess({ message: "Password has been reset. You can now sign in with your new password." });
});
