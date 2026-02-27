import { randomBytes } from "crypto";
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
} from "@/lib/auth";
import { sendVendorVerificationEmail } from "@/lib/email";

const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_EXPIRY_HOURS = 24;

/**
 * POST /api/auth/vendor-register — create a new vendor (Seller) and send verification email.
 * Seller is created with status PENDING_VERIFICATION. No session is set until email is verified.
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
  const verificationToken = randomBytes(VERIFICATION_TOKEN_BYTES).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

  const seller = await prisma.seller.create({
    data: {
      email,
      passwordHash,
      businessName,
      ownerName,
      phone: phone ?? null,
      status: "PENDING_VERIFICATION",
      emailVerified: false,
      verificationToken,
      verificationTokenExpires,
    },
    select: {
      id: true,
      email: true,
      businessName: true,
      ownerName: true,
      status: true,
    },
  });

  await sendVendorVerificationEmail(email, verificationToken);

  return apiSuccess({
    message: "Registration successful. Please check your email to verify your account.",
    vendor: {
      id: seller.id,
      email: seller.email,
      businessName: seller.businessName,
      ownerName: seller.ownerName,
      status: seller.status,
      emailVerified: false,
    },
  });
});
