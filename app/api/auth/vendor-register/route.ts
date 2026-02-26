import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiValidationError,
  apiConflict,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  validateVendorRegister,
  formatValidationDetails,
  hashPassword,
  signToken,
  setAuthCookie,
} from "@/lib/auth";

/**
 * POST /api/auth/vendor-register — create a new vendor (Seller) and optionally log them in.
 * Creates seller with status DRAFT. Client can then complete profile and submit for approval.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const validation = validateVendorRegister(body);
  if (!validation.success) {
    return apiValidationError(
      "Validation failed",
      formatValidationDetails(validation.errors)
    );
  }

  const { email, password, businessName, ownerName, phone } = validation.data;

  const existing = await prisma.seller.findFirst({
    where: { email, deletedAt: null },
    select: { id: true },
  });
  if (existing) {
    return apiConflict("A vendor account with this email already exists");
  }

  const passwordHash = await hashPassword(password);

  const seller = await prisma.seller.create({
    data: {
      email,
      passwordHash,
      businessName,
      ownerName,
      phone: phone ?? null,
      status: "DRAFT",
    },
    select: {
      id: true,
      email: true,
      businessName: true,
      ownerName: true,
      status: true,
    },
  });

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
