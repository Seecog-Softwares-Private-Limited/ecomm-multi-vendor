import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { sendCustomerVerificationEmail } from "@/lib/email";

const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_EXPIRY_HOURS = 72;

/**
 * POST /api/auth/resend-customer-verification — body: { email }
 * Resends sign-up confirmation if the account exists and is not verified yet.
 * Always returns a generic success message (no email enumeration).
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const email =
    typeof body === "object" &&
    body !== null &&
    typeof (body as { email?: unknown }).email === "string"
      ? (body as { email: string }).email.trim().toLowerCase()
      : "";

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return apiBadRequest("Enter a valid email address.");
  }

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true, emailVerified: true },
  });

  if (user && !user.emailVerified) {
    const verificationToken = randomBytes(VERIFICATION_TOKEN_BYTES).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, verificationTokenExpires },
    });
    await sendCustomerVerificationEmail(email, verificationToken);
  }

  return apiSuccess({
    message:
      "If this email has a pending account, we sent a new confirmation link. Check your inbox.",
  });
});
