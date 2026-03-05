import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiBadRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { SellerStatus } from "@prisma/client";

/** Generic message for invalid/expired token — do not reveal whether email exists. */
const INVALID_OR_EXPIRED_MESSAGE = "Invalid or expired verification link. Please request a new one or register again.";

/**
 * GET /api/auth/verify-email?token=... — verify vendor email via token.
 * - Valid token: set email_verified = true, status = DRAFT (vendor must still complete & submit profile/KYC).
 * - SUBMITTED/UNDER_REVIEW is set only when they submit for approval via submit-for-approval.
 * - Already verified: return success with appropriate message.
 * - Invalid/expired: return same generic error (no info leak).
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

  if (!seller) {
    return apiBadRequest(INVALID_OR_EXPIRED_MESSAGE);
  }

  if (seller.emailVerified) {
    return apiSuccess({
      verified: true,
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
      // Keep token so the same link still works and shows "already verified" on repeat clicks
    },
  });

  return apiSuccess({
    verified: true,
    message: "Email verified. Complete your profile & KYC, then submit for approval.",
  });
});
