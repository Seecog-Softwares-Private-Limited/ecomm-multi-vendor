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
 * POST /api/auth/vendor-login — authenticate vendor (Seller table) and set session cookie.
 * JWT sub = seller.id so GET /api/vendor/* can use session.sub as sellerId.
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

  const seller = await prisma.seller.findFirst({
    where: { email, deletedAt: null },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      businessName: true,
      ownerName: true,
      status: true,
    },
  });

  if (!seller) {
    return apiUnauthorized("Invalid email or password");
  }

  const hash = seller.passwordHash?.trim() ?? "";
  if (!hash || hash.length < 20) {
    return apiUnauthorized("Invalid email or password");
  }

  let valid = false;
  try {
    valid = await verifyPassword(password, hash);
  } catch {
    valid = false;
  }
  if (!valid) {
    return apiUnauthorized("Invalid email or password");
  }

  const token = await signToken({
    sub: seller.id,
    email: seller.email,
    role: "SELLER",
  });

  const response = apiSuccess({
    vendor: {
      id: seller.id,
      email: seller.email,
      businessName: seller.businessName,
      ownerName: seller.ownerName,
      status: seller.status,
      role: "SELLER",
    },
  });

  setAuthCookie(response, token);
  return response;
});
