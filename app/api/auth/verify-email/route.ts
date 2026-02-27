import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiBadRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/** Generic message for invalid/expired token — do not reveal whether email exists. */
const INVALID_OR_EXPIRED_MESSAGE = "Invalid or expired verification link. Please request a new one or register again.";

/**
 * GET /api/auth/verify-email?token=... — verify vendor email via token.
 * - Valid token: set email_verified = true, status = UNDER_REVIEW, clear token fields.
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
      status: "UNDER_REVIEW",
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  return apiSuccess({
    verified: true,
    message: "Email verified. Awaiting admin approval.",
  });
});
