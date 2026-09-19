import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
  apiConflict,
  apiNotFound,
  apiValidationError,
} from "@/lib/api";
import { getSession, formatValidationDetails, signToken, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isPlaceholderVendorEmail,
  syncSellerAuthOnboardingComplete,
  sellerAuthStatusFields,
} from "@/lib/auth/seller-onboarding";
import { sendVendorVerificationEmail, emailConfig } from "@/lib/email";
import { randomBytes } from "crypto";
import { z } from "zod";

const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_EXPIRY_HOURS = 72;

const vendorOnboardingProfileSchema = z.object({
  name: z.string().min(1, "Full name is required").max(255).trim().optional(),
  ownerName: z.string().min(1).max(255).trim().optional(),
  email: z.string().email("Enter a valid email address").max(255).trim().toLowerCase(),
}).refine((d) => Boolean(d.name?.trim() || d.ownerName?.trim()), {
  message: "Full name is required",
  path: ["name"],
});

/**
 * POST /api/auth/vendor-onboarding/profile
 * Phone-first: authenticated incomplete seller submits name + real email.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Not authenticated");
  if (session.role !== "SELLER") {
    return apiForbidden("Only vendor accounts can complete this onboarding step.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  if (typeof body !== "object" || body === null) {
    return apiBadRequest("Body must be an object.");
  }
  const b = body as Record<string, unknown>;
  if ("password" in b && b.password != null && b.password !== "") {
    return apiBadRequest("Password is not accepted on this endpoint.");
  }
  if ("phone" in b && b.phone != null && String(b.phone).trim() !== "") {
    return apiBadRequest("Phone cannot be changed here. Use phone OTP to verify a number.");
  }

  const parsed = vendorOnboardingProfileSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError("Validation failed", formatValidationDetails(parsed.error.issues));
  }

  const ownerName = (parsed.data.name ?? parsed.data.ownerName ?? "").trim();
  const email = parsed.data.email;

  if (isPlaceholderVendorEmail(email)) {
    return apiBadRequest("Enter a real email address.");
  }

  const seller = await prisma.seller.findFirst({
    where: { id: session.sub, deletedAt: null },
    select: {
      id: true,
      email: true,
      phone: true,
      phoneVerified: true,
      emailVerified: true,
      authOnboardingComplete: true,
    },
  });
  if (!seller) return apiNotFound("Vendor not found");
  if (!seller.phoneVerified || !seller.phone?.trim()) {
    return apiBadRequest("Verify your phone number with OTP before adding email.");
  }

  const emailTaken = await prisma.seller.findFirst({
    where: {
      email,
      deletedAt: null,
      NOT: { id: seller.id },
    },
    select: { id: true },
  });
  if (emailTaken) {
    return apiConflict(
      "This email is already registered with another account. Please log in to that account."
    );
  }

  const verificationToken = randomBytes(VERIFICATION_TOKEN_BYTES).toString("hex");
  const verificationTokenExpires = new Date(
    Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000
  );

  const emailChanged = seller.email.trim().toLowerCase() !== email;
  const wasPlaceholder = isPlaceholderVendorEmail(seller.email);

  await prisma.seller.update({
    where: { id: seller.id },
    data: {
      ownerName,
      email,
      emailVerified: emailChanged || wasPlaceholder ? false : seller.emailVerified,
      ...(emailChanged || wasPlaceholder || !seller.emailVerified
        ? { verificationToken, verificationTokenExpires }
        : {}),
    },
  });

  let verificationLink: string | undefined;
  let emailSent = false;
  if (emailChanged || wasPlaceholder || !seller.emailVerified) {
    const emailResult = await sendVendorVerificationEmail(email, verificationToken);
    emailSent = emailResult.sent;
    const appUrl = emailConfig.appUrl.replace(/\/$/, "");
    verificationLink = `${appUrl}/vendor/verify?token=${encodeURIComponent(verificationToken)}`;
  }

  const authOnboardingComplete = await syncSellerAuthOnboardingComplete(seller.id);
  const fresh = await prisma.seller.findFirst({
    where: { id: seller.id },
    select: {
      id: true,
      email: true,
      ownerName: true,
      businessName: true,
      status: true,
      phone: true,
      phoneVerified: true,
      emailVerified: true,
      authOnboardingComplete: true,
    },
  });

  const token = await signToken({
    sub: seller.id,
    email: fresh?.email ?? email,
    role: "SELLER",
  });

  const response = apiSuccess({
    vendor: {
      id: fresh?.id ?? seller.id,
      email: fresh?.email ?? email,
      ownerName: fresh?.ownerName ?? ownerName,
      businessName: fresh?.businessName,
      status: fresh?.status,
      role: "SELLER",
      ...sellerAuthStatusFields({
        phone: fresh?.phone ?? seller.phone,
        phoneVerified: fresh?.phoneVerified ?? seller.phoneVerified,
        emailVerified: fresh?.emailVerified ?? false,
        authOnboardingComplete,
      }),
    },
    message: authOnboardingComplete
      ? "Account setup complete."
      : "Check your email and confirm your address using the link we sent.",
    emailSent,
    ...(process.env.NODE_ENV === "development" && verificationLink
      ? { verificationLink }
      : {}),
  });
  setAuthCookie(response, token);
  return response;
});
