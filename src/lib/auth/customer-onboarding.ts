/**
 * Customer auth onboarding completeness (Phase 2).
 *
 * Complete only when:
 *   name exists + real email + emailVerified + phone + phoneVerified
 *
 * Placeholder emails used for phone-first accounts (schema requires email)
 * are never treated as a real email.
 */

import { prisma } from "@/lib/prisma";
import { isPlaceholderCustomerEmail } from "@/lib/auth/phone";

export type CustomerOnboardingFields = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
};

export function customerHasName(user: {
  firstName: string | null;
  lastName: string | null;
}): boolean {
  return Boolean(user.firstName?.trim() || user.lastName?.trim());
}

export function customerHasRealEmail(email: string): boolean {
  return Boolean(email?.trim()) && !isPlaceholderCustomerEmail(email);
}

/** Pure check — does not read/write the database. */
export function computeAuthOnboardingComplete(
  user: CustomerOnboardingFields
): boolean {
  return (
    customerHasName(user) &&
    customerHasRealEmail(user.email) &&
    user.emailVerified === true &&
    Boolean(user.phone?.trim()) &&
    user.phoneVerified === true
  );
}

/**
 * Customer App soft readiness (phone optional until order).
 * Used only when the Customer App environment cookie is present.
 * Must NOT be written to User.authOnboardingComplete.
 */
export function computeCustomerAppAuthReady(
  user: Pick<
    CustomerOnboardingFields,
    "firstName" | "lastName" | "email" | "emailVerified"
  >
): boolean {
  return (
    customerHasName(user) &&
    customerHasRealEmail(user.email) &&
    user.emailVerified === true
  );
}

/** Account has a verified phone suitable for placing an order. */
export function customerHasVerifiedPhone(user: {
  phone: string | null;
  phoneVerified: boolean;
}): boolean {
  return Boolean(user.phone?.trim()) && user.phoneVerified === true;
}

export const CUSTOMER_ONBOARDING_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  phoneVerified: true,
  emailVerified: true,
  profileCompleted: true,
  authOnboardingComplete: true,
} as const;

/**
 * Recompute and persist `authOnboardingComplete` for a customer.
 * Returns the updated boolean (false if user missing).
 */
export async function syncCustomerAuthOnboardingComplete(
  userId: string
): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      emailVerified: true,
      phone: true,
      phoneVerified: true,
      authOnboardingComplete: true,
    },
  });
  if (!user) return false;

  const complete = computeAuthOnboardingComplete(user);
  if (user.authOnboardingComplete !== complete) {
    await prisma.user.update({
      where: { id: userId },
      data: { authOnboardingComplete: complete },
    });
  }
  return complete;
}

/** Session/API payload flags for auth responses (gate enforcement is Phase 4). */
export function customerAuthStatusFields(user: {
  phone: string | null;
  phoneVerified: boolean;
  profileCompleted: boolean;
  authOnboardingComplete: boolean;
}) {
  return {
    phoneVerified: user.phoneVerified,
    profileCompleted: user.profileCompleted,
    authOnboardingComplete: user.authOnboardingComplete,
    /** Legacy UI flag: missing phone or old profileCompleted flag. */
    needsProfileCompletion:
      !user.phone?.trim() || !user.profileCompleted,
    /** Prefer this for new clients: auth onboarding not finished. */
    needsAuthOnboarding: !user.authOnboardingComplete,
  };
}
