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
      },
    });

    return apiSuccess({
      verified: true,
      accountType: "vendor",
      message: "Email verified. Complete your profile & KYC, then submit for approval.",
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

  return apiSuccess({
    verified: true,
    accountType: "customer",
    message: "Email confirmed. You can sign in to your account.",
  });
});
