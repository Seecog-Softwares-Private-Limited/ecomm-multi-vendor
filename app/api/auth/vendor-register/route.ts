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
import { SellerStatus } from "@prisma/client";
import {
  validateVendorRegister,
  formatValidationDetails,
  hashPassword,
} from "@/lib/auth";
import { emailConfig, sendVendorVerificationEmail } from "@/lib/email";

const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_EXPIRY_HOURS = 72; // 3 days so the link stays valid

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

  const { email, password, businessName, ownerName, phone, phoneProofToken } = validation.data;

  const { normalizeIndianPhone, INDIAN_MOBILE_HINT } = await import("@/lib/auth/phone");
  const phoneNorm = normalizeIndianPhone(phone);
  if (!phoneNorm) {
    return apiValidationError("Validation failed", { phone: INDIAN_MOBILE_HINT });
  }

  const { verifyVendorPhoneRegistrationProof } = await import("@/lib/auth/registration-proof");
  const phoneProof = await verifyVendorPhoneRegistrationProof(phoneProofToken, phoneNorm);
  if (!phoneProof.ok) {
    return apiBadRequest("Verify your phone with OTP before creating an account.");
  }

  const existing = await prisma.seller.findFirst({
    where: { email, deletedAt: null },
    select: { id: true },
  });
  if (existing) {
    return apiConflict("A vendor account with this email already exists");
  }

  const { findActiveSellersByPhoneNorm } = await import("@/lib/auth/seller-onboarding");
  const phoneOwners = await findActiveSellersByPhoneNorm(phoneNorm);
  if (phoneOwners.length > 0) {
    return apiConflict("This phone number is already registered with another vendor account.");
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
      phone: phoneNorm,
      status: SellerStatus.PENDING_VERIFICATION,
      emailVerified: false,
      phoneVerified: true,
      authOnboardingComplete: false,
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

  const emailResult = await sendVendorVerificationEmail(email, verificationToken);

  const appUrl = emailConfig.appUrl.replace(/\/$/, "");
  const verificationLink = `${appUrl}/vendor/verify?token=${encodeURIComponent(verificationToken)}`;

  const payload: {
    message: string;
    vendor: { id: string; email: string; businessName: string; ownerName: string; status: string; emailVerified: boolean };
    emailSent: boolean;
    verificationLink?: string;
  } = {
    message: emailResult.sent
      ? "Registration successful. Please check your email to verify your account."
      : "Registration successful. Verify your email using the link below (no email was sent — SMTP not configured).",
    vendor: {
      id: seller.id,
      email: seller.email,
      businessName: seller.businessName,
      ownerName: seller.ownerName,
      status: seller.status,
      emailVerified: false,
    },
    emailSent: emailResult.sent,
  };

  if (!emailResult.sent && process.env.NODE_ENV === "development") {
    payload.verificationLink = verificationLink;
  }

  const { getSmsNotificationService } = await import("@/services/sms-notification.service");
  getSmsNotificationService().onVendorRegistration({ businessName: seller.businessName });

  return apiSuccess(payload);
});
