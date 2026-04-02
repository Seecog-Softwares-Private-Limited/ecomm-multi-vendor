import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiValidationError,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { hashPassword, registerSchema, formatValidationDetails } from "@/lib/auth";

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
  if (!newPassword) errors.newPassword = "New password is required";
  if (Object.keys(errors).length) {
    return { success: false, errors };
  }
  const pwd = registerSchema.pick({ password: true }).safeParse({ password: newPassword });
  if (!pwd.success) {
    return { success: false, errors: formatValidationDetails(pwd.error.issues) };
  }
  return { success: true, token, newPassword: pwd.data.password };
}

/**
 * POST /api/auth/reset-password — set a new password for a customer using a valid reset token.
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

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      deletedAt: null,
    },
    select: {
      id: true,
      passwordResetExpires: true,
    },
  });

  if (!user) {
    return apiValidationError("Invalid or expired reset link", {
      token: "Please request a new password reset.",
    });
  }

  if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    return apiValidationError("Reset link has expired", {
      token: "Please request a new password reset.",
    });
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return apiSuccess({ message: "Password has been reset. You can now sign in." });
});
