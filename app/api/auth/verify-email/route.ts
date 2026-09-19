import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiBadRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { SellerStatus } from "@prisma/client";

/** Generic message for invalid/expired token — do not reveal whether email exists. */
const INVALID_OR_EXPIRED_MESSAGE = "Invalid or expired verification link. Please request a new one or register again.";

/**
 * GET /api/auth/verify-email?token=...
 * - Vendor: same as before (seller token → verified, DRAFT).
 * - Customer: user token → emailVerified true, clear token.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return apiBadRequest(INVALID_OR_EXPIRED_MESSAGE);
  }

  const seller = await prisma.seller.findFirst({
    where: {
      verificationToken: token,
      deletedAt: null,
    },
    select: {
      id: true,
      emailVerified: true,
      verificationTokenExpires: true,
    },
  });

  if (seller) {
    if (seller.emailVerified) {
      return apiSuccess({
        verified: true,
        accountType: "vendor",
        message: "Email is already verified. You can log in and await admin approval.",
      });
    }

    const now = new Date();
    if (!seller.verificationTokenExpires || seller.verificationTokenExpires < now) {
      return apiBadRequest(INVALID_OR_EXPIRED_MESSAGE);
    }

    await prisma.seller.update({
      where: { id: seller.id },
      data: {
        emailVerified: true,
        status: SellerStatus.DRAFT,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    const { syncSellerAuthOnboardingComplete } = await import(
      "@/lib/auth/seller-onboarding"
    );
    const authOnboardingComplete = await syncSellerAuthOnboardingComplete(seller.id);

    return apiSuccess({
      verified: true,
      accountType: "vendor",
      authOnboardingComplete,
      needsAuthOnboarding: !authOnboardingComplete,
      message: authOnboardingComplete
        ? "Email verified. Your vendor account authentication is complete."
        : "Email verified. Complete phone verification if needed, then continue profile & KYC.",
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      deletedAt: null,
    },
    select: {
      id: true,
      emailVerified: true,
      verificationTokenExpires: true,
    },
  });

  if (!user) {
    return apiBadRequest(INVALID_OR_EXPIRED_MESSAGE);
  }

  if (user.emailVerified) {
    return apiSuccess({
      verified: true,
      accountType: "customer",
      message: "Your email is already verified. You can sign in.",
    });
  }

  const now = new Date();
  if (!user.verificationTokenExpires || user.verificationTokenExpires < now) {
    return apiBadRequest(INVALID_OR_EXPIRED_MESSAGE);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  // Keep auth onboarding flag accurate after email verification (link flow unchanged).
  // Does not create a password.
  const { syncCustomerAuthOnboardingComplete } = await import(
    "@/lib/auth/customer-onboarding"
  );
  const authOnboardingComplete = await syncCustomerAuthOnboardingComplete(user.id);

  return apiSuccess({
    verified: true,
    accountType: "customer",
    authOnboardingComplete,
    needsAuthOnboarding: !authOnboardingComplete,
    message: authOnboardingComplete
      ? "Email confirmed. Your account is ready."
      : "Email confirmed. Complete any remaining onboarding steps to finish your account.",
  });
});
