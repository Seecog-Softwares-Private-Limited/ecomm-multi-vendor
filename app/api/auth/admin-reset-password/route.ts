import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiValidationError,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { validateAdminNewPassword } from "@/lib/auth/admin-password";

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
  } else {
    const pwdError = validateAdminNewPassword(newPassword);
    if (pwdError) errors.newPassword = pwdError;
  }
  if (Object.keys(errors).length) {
    return { success: false, errors };
  }
  return { success: true, token, newPassword };
}

/**
 * POST /api/auth/admin-reset-password — set new password for admin / super-admin using reset token.
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

  const admin = await prisma.admin.findFirst({
    where: {
      passwordResetToken: token,
      deletedAt: null,
    },
    select: {
      id: true,
      passwordResetExpires: true,
      isSuperAdmin: true,
    },
  });

  if (!admin) {
    return apiValidationError("Invalid or expired reset link", {
      token: "Please request a new password reset.",
    });
  }

  if (!admin.passwordResetExpires || admin.passwordResetExpires < new Date()) {
    return apiValidationError("Reset link has expired", {
      token: "Please request a new password reset.",
    });
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return apiSuccess({
    message: "Password has been reset. You can now sign in with your new password.",
    isSuperAdmin: admin.isSuperAdmin,
  });
});
