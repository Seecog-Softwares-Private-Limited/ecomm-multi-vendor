/**
 * Phone-first customer onboarding: replace placeholder email with a real email
 * and set name. Reuses the existing email verification link flow.
 */

import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { isPlaceholderCustomerEmail } from "@/lib/auth/phone";
import {
  CUSTOMER_ONBOARDING_SELECT,
  customerAuthStatusFields,
  customerHasRealEmail,
  syncCustomerAuthOnboardingComplete,
} from "@/lib/auth/customer-onboarding";
import { emailConfig, sendCustomerVerificationEmail } from "@/lib/email";

const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_EXPIRY_HOURS = 72;

export const EMAIL_ALREADY_REGISTERED_MESSAGE =
  "This email is already registered with another account. Please log in to that account instead.";

export const PHONE_NOT_VERIFIED_ONBOARDING_MESSAGE =
  "Verify your phone with OTP before completing your profile.";

export type CompletePhoneFirstOnboardingInput = {
  firstName: string | null;
  lastName: string | null;
  email: string;
};

export type CompletePhoneFirstOnboardingResult =
  | {
      ok: true;
      needsEmailVerification: boolean;
      emailSent: boolean;
      verificationLink?: string;
      user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        phoneVerified: boolean;
        profileCompleted: boolean;
        authOnboardingComplete: boolean;
        needsProfileCompletion: boolean;
        needsAuthOnboarding: boolean;
        emailVerified: boolean;
      };
    }
  | { ok: false; kind: "not_found" }
  | { ok: false; kind: "phone_not_verified"; message: string }
  | { ok: false; kind: "email_conflict"; message: string }
  | { ok: false; kind: "invalid"; message: string };

function buildVerificationLink(token: string): string {
  const appUrl =
    emailConfig.appUrl.replace(/\/$/, "") ||
    `http://localhost:${process.env.PORT ?? "3000"}`;
  return `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
}

/**
 * Authenticated phone-first (or phone-verified incomplete) customer submits
 * name + real email. Does not accept password or phone changes.
 */
export async function completePhoneFirstOnboarding(
  userId: string,
  input: CompletePhoneFirstOnboardingInput
): Promise<CompletePhoneFirstOnboardingResult> {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      ...CUSTOMER_ONBOARDING_SELECT,
      passwordHash: true,
    },
  });

  if (!user) {
    return { ok: false, kind: "not_found" };
  }

  if (!user.phoneVerified || !user.phone?.trim()) {
    return {
      ok: false,
      kind: "phone_not_verified",
      message: PHONE_NOT_VERIFIED_ONBOARDING_MESSAGE,
    };
  }

  const email = input.email.trim().toLowerCase();
  if (!email || isPlaceholderCustomerEmail(email)) {
    return {
      ok: false,
      kind: "invalid",
      message: "Enter a valid personal email address.",
    };
  }

  if (!input.firstName?.trim() && !input.lastName?.trim()) {
    return {
      ok: false,
      kind: "invalid",
      message: "Name is required",
    };
  }

  const emailOwner = await prisma.user.findFirst({
    where: { email, deletedAt: null, id: { not: userId } },
    select: { id: true },
  });
  if (emailOwner) {
    return {
      ok: false,
      kind: "email_conflict",
      message: EMAIL_ALREADY_REGISTERED_MESSAGE,
    };
  }

  const currentIsPlaceholder = isPlaceholderCustomerEmail(user.email);
  const emailChanging = user.email.toLowerCase() !== email;
  const needsNewVerification =
    emailChanging || !user.emailVerified || currentIsPlaceholder;

  // Already on this real email and verified — only refresh name / sync flags.
  if (!needsNewVerification && !emailChanging) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
      },
    });
    const authOnboardingComplete = await syncCustomerAuthOnboardingComplete(userId);
    const updated = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { ...CUSTOMER_ONBOARDING_SELECT, emailVerified: true },
    });
    if (!updated) return { ok: false, kind: "not_found" };
    return {
      ok: true,
      needsEmailVerification: false,
      emailSent: false,
      user: {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
        emailVerified: updated.emailVerified,
        ...customerAuthStatusFields({
          phone: updated.phone,
          phoneVerified: updated.phoneVerified,
          profileCompleted: updated.profileCompleted,
          authOnboardingComplete,
        }),
      },
    };
  }

  const verificationToken = randomBytes(VERIFICATION_TOKEN_BYTES).toString("hex");
  const verificationTokenExpires = new Date(
    Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000
  );

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        emailVerified: false,
        authOnboardingComplete: false,
        verificationToken,
        verificationTokenExpires,
      },
    });
  } catch (e: unknown) {
    const errCode =
      e && typeof e === "object" && "code" in e
        ? String((e as { code: unknown }).code)
        : "";
    if (errCode === "P2002") {
      return {
        ok: false,
        kind: "email_conflict",
        message: EMAIL_ALREADY_REGISTERED_MESSAGE,
      };
    }
    throw e;
  }

  const emailResult = await sendCustomerVerificationEmail(email, verificationToken);
  await syncCustomerAuthOnboardingComplete(userId);

  const updated = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { ...CUSTOMER_ONBOARDING_SELECT, emailVerified: true },
  });
  if (!updated) return { ok: false, kind: "not_found" };

  // Sanity: placeholder must be gone after successful replace.
  if (!customerHasRealEmail(updated.email) || isPlaceholderCustomerEmail(updated.email)) {
    return {
      ok: false,
      kind: "invalid",
      message: "Could not save your email. Please try again.",
    };
  }

  const payload: CompletePhoneFirstOnboardingResult = {
    ok: true,
    needsEmailVerification: true,
    emailSent: emailResult.sent,
    user: {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
      emailVerified: updated.emailVerified,
      ...customerAuthStatusFields({
        phone: updated.phone,
        phoneVerified: updated.phoneVerified,
        profileCompleted: updated.profileCompleted,
        authOnboardingComplete: updated.authOnboardingComplete,
      }),
    },
  };

  if (!emailResult.sent && process.env.NODE_ENV === "development") {
    payload.verificationLink = buildVerificationLink(verificationToken);
  }

  return payload;
}
