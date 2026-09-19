/**
 * Phone-first customer onboarding: replace placeholder email with a real email
 * and set name. Email verification is completed via email OTP (not a link).
 */

import { prisma } from "@/lib/prisma";
import { isPlaceholderCustomerEmail } from "@/lib/auth/phone";
import {
  CUSTOMER_ONBOARDING_SELECT,
  customerAuthStatusFields,
  customerHasRealEmail,
  syncCustomerAuthOnboardingComplete,
} from "@/lib/auth/customer-onboarding";

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

/**
 * Authenticated phone-first (or phone-verified incomplete) customer submits
 * name + real email. Does not accept password or phone changes.
 * Does not send an email link — client must call onboarding email OTP next.
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

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        emailVerified: false,
        authOnboardingComplete: false,
        verificationToken: null,
        verificationTokenExpires: null,
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

  await syncCustomerAuthOnboardingComplete(userId);

  const updated = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { ...CUSTOMER_ONBOARDING_SELECT, emailVerified: true },
  });
  if (!updated) return { ok: false, kind: "not_found" };

  if (!customerHasRealEmail(updated.email) || isPlaceholderCustomerEmail(updated.email)) {
    return {
      ok: false,
      kind: "invalid",
      message: "Could not save your email. Please try again.",
    };
  }

  return {
    ok: true,
    needsEmailVerification: true,
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
        authOnboardingComplete: updated.authOnboardingComplete,
      }),
    },
  };
}
