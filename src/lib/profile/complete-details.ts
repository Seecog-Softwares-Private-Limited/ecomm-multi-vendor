import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import { syncCustomerAuthOnboardingComplete } from "@/lib/auth/customer-onboarding";

export type CompleteProfileDetailsInput = {
  phone: string;
  firstName?: string;
  lastName?: string;
  /** When true, only the mobile number is saved; name fields are ignored. */
  skipOptional?: boolean;
};

/**
 * Legacy post-login profile helper.
 *
 * Phase 3: never marks `phoneVerified`. Saving a phone here does not complete
 * Google-first onboarding — the customer must still verify via OTP.
 * Verified phones cannot be replaced through this endpoint.
 */
export async function completeProfileDetails(
  userId: string,
  input: CompleteProfileDetailsInput
): Promise<{ error: string | null }> {
  const phoneNorm = normalizeIndianPhone(input.phone);
  if (!phoneNorm) return { error: INDIAN_MOBILE_HINT };

  const current = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      phone: true,
      phoneVerified: true,
    },
  });
  if (!current) return { error: "User not found" };

  if (
    current.phoneVerified &&
    current.phone &&
    current.phone !== phoneNorm
  ) {
    return {
      error:
        "Your verified phone cannot be changed here. Sign in with OTP on your existing number, or contact support.",
    };
  }

  const taken = await prisma.user.findFirst({
    where: { phone: phoneNorm, deletedAt: null, id: { not: userId } },
    select: { id: true },
  });
  if (taken) {
    return {
      error:
        "This phone number is already registered with another account. Please log in to that account.",
    };
  }

  const data: {
    phone: string;
    phoneVerified?: boolean;
    profileCompleted: boolean;
    authOnboardingComplete?: boolean;
    firstName?: string | null;
    lastName?: string | null;
  } = {
    phone: phoneNorm,
    // Legacy UI flag only — not the auth onboarding source of truth.
    profileCompleted: true,
  };

  // Never treat form submit as phone verification.
  if (!current.phoneVerified || current.phone !== phoneNorm) {
    data.phoneVerified = false;
    data.authOnboardingComplete = false;
  }

  if (!input.skipOptional) {
    if (input.firstName !== undefined) {
      data.firstName = input.firstName.trim() || null;
    }
    if (input.lastName !== undefined) {
      data.lastName = input.lastName.trim() || null;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  await syncCustomerAuthOnboardingComplete(userId);

  return { error: null };
}
