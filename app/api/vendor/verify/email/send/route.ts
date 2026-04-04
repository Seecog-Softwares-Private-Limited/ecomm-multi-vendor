import { randomInt } from "crypto";
import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiBadRequest, apiError, apiForbidden, Status } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPhoneOtp } from "@/lib/auth/phone-otp-hash";
import { sendMail } from "@/lib/email/send";

const RESEND_COOLDOWN_MS = 60_000;
const OTP_EXPIRY_MS = 10 * 60_000;

/**
 * POST /api/vendor/verify/email/send
 * Generates a 6-digit OTP, stores its HMAC hash on the seller row, and emails it.
 * Requires an active vendor session.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER") return apiForbidden("Vendor access required");
  const sellerId = session.sub;

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { email: true, emailOtpExpires: true, emailVerified: true },
  });
  if (!seller) return apiBadRequest("Vendor not found");
  if (!seller.email?.trim()) return apiBadRequest("No email address found on your account.");

  // Rate-limit
  if (seller.emailOtpExpires && seller.emailOtpExpires.getTime() > Date.now() + OTP_EXPIRY_MS - RESEND_COOLDOWN_MS) {
    return apiError("Please wait a minute before requesting another code.", Status.TOO_MANY_REQUESTS, "TOO_MANY_REQUESTS");
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  // Reuse phone-otp HMAC helper (same mechanism — key = sellerId, not phone)
  const codeHash = hashPhoneOtp(sellerId, code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await prisma.seller.update({
    where: { id: sellerId },
    data: { emailOtpCode: codeHash, emailOtpExpires: expiresAt },
  });

  const result = await sendMail({
    to: seller.email,
    subject: "Verify your email — IndoVyapar Vendor",
    text: [
      "Your email verification code is:",
      "",
      `  ${code}`,
      "",
      "This code expires in 10 minutes.",
      "If you did not request this, you can safely ignore this email.",
    ].join("\n"),
    html: `
      <p style="font-family:sans-serif;font-size:15px">Your email verification code is:</p>
      <p style="font-family:monospace;font-size:32px;font-weight:bold;letter-spacing:6px;color:#FF6A00">${code}</p>
      <p style="font-family:sans-serif;font-size:13px;color:#64748B">This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
    `,
  });

  return apiSuccess({
    message: result.sent
      ? `Verification code sent to ${seller.email}.`
      : "Email not configured — use the code below (dev only).",
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    emailSent: result.sent,
    ...(process.env.NODE_ENV !== "production" ? { devOtp: code } : {}),
  });
});
