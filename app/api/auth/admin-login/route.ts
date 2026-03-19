import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiValidationError,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  validateLogin,
  formatValidationDetails,
  verifyPassword,
  signToken,
  setAuthCookie,
} from "@/lib/auth";

/**
 * POST /api/auth/admin-login — authenticate admin (Admin table) and set session cookie.
 * JWT sub = admin.id, role = ADMIN so middleware allows /admin/* access.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const validation = validateLogin(body);
  if (!validation.success) {
    return apiValidationError(
      "Validation failed",
      formatValidationDetails(validation.errors)
    );
  }

  const { email, password } = validation.data;

  const admin = await prisma.admin.findFirst({
    where: { email, deletedAt: null },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      name: true,
      status: true,
      approvalStatus: true,
      isSuperAdmin: true,
      roleId: true,
    },
  });

  if (!admin) {
    return apiUnauthorized("Invalid email or password");
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    return apiUnauthorized("Invalid email or password");
  }

  // Only approved + active admins can login (except super admin)
  if (!admin.isSuperAdmin) {
    if (admin.approvalStatus !== "APPROVED") {
      return apiUnauthorized("Your admin account is not approved yet");
    }
    if (admin.status !== "ACTIVE") {
      return apiUnauthorized("Your admin account is not active");
    }
    if (!admin.roleId) {
      return apiUnauthorized("No role assigned. Please contact Super Admin");
    }
  }

  const token = await signToken({
    sub: admin.id,
    email: admin.email,
    role: "ADMIN",
  });

  const response = apiSuccess({
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: "ADMIN",
      status: admin.status,
      approvalStatus: admin.approvalStatus,
      isSuperAdmin: admin.isSuperAdmin,
    },
  });

  setAuthCookie(response, token);
  return response;
});
