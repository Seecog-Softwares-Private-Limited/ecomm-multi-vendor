/**
 * Vendor (Seller) auth onboarding completeness.
 * Separate from KYC / admin approval (Seller.status).
 *
 * Complete when:
 *   ownerName + real email + emailVerified + phone + phoneVerified
 *   (+ passwordHash required only for email/password accounts that have one —
 *    phone/Google/Apple may have passwordHash = null)
 *
 * Placeholder emails for phone-first are never treated as real.
 */

import { prisma } from "@/lib/prisma";

export const VENDOR_PLACEHOLDER_EMAIL_DOMAINS = [
  "phone-otp.vendor.indovyapar.local",
  "pending.vendor.indovyapar.local",
] as const;

export function placeholderEmailForVendorPhoneNorm(phoneNorm: string): string {
  return `${phoneNorm}@phone-otp.vendor.indovyapar.local`;
}

export function isPlaceholderVendorEmail(email: string | null | undefined): boolean {
  if (!email) return true;
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at < 0) return false;
  const domain = normalized.slice(at + 1);
  return (VENDOR_PLACEHOLDER_EMAIL_DOMAINS as readonly string[]).includes(domain);
}

export type SellerOnboardingFields = {
  ownerName: string;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
};

export function sellerHasName(seller: { ownerName: string }): boolean {
  return Boolean(seller.ownerName?.trim()) && seller.ownerName.trim().toLowerCase() !== "pending";
}

export function sellerHasRealEmail(email: string): boolean {
  return Boolean(email?.trim()) && !isPlaceholderVendorEmail(email);
}

/** Pure check — does not read/write the database. */
export function computeSellerAuthOnboardingComplete(
  seller: SellerOnboardingFields
): boolean {
  return (
    sellerHasName(seller) &&
    sellerHasRealEmail(seller.email) &&
    seller.emailVerified === true &&
    Boolean(seller.phone?.trim()) &&
    seller.phoneVerified === true
  );
}

export const SELLER_ONBOARDING_SELECT = {
  id: true,
  email: true,
  ownerName: true,
  businessName: true,
  phone: true,
  phoneVerified: true,
  emailVerified: true,
  authOnboardingComplete: true,
  oauthProvider: true,
  oauthProviderId: true,
  appleUserId: true,
  passwordHash: true,
  status: true,
} as const;

/**
 * Recompute and persist `authOnboardingComplete` for a seller.
 * Does not change KYC / approval status.
 */
export async function syncSellerAuthOnboardingComplete(
  sellerId: string
): Promise<boolean> {
  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: {
      ownerName: true,
      email: true,
      emailVerified: true,
      phone: true,
      phoneVerified: true,
      authOnboardingComplete: true,
    },
  });
  if (!seller) return false;

  const complete = computeSellerAuthOnboardingComplete(seller);
  if (seller.authOnboardingComplete !== complete) {
    await prisma.seller.update({
      where: { id: sellerId },
      data: { authOnboardingComplete: complete },
    });
  }
  return complete;
}

export function sellerAuthStatusFields(seller: {
  phone: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  authOnboardingComplete: boolean;
}) {
  return {
    phoneVerified: seller.phoneVerified,
    emailVerified: seller.emailVerified,
    authOnboardingComplete: seller.authOnboardingComplete,
    needsAuthOnboarding: !seller.authOnboardingComplete,
  };
}

/**
 * Find active seller by normalized Indian phone (91xxxxxxxxxx).
 * Matches common stored formats (10-digit, +91, 91…).
 */
export async function findActiveSellerByPhoneNorm(phoneNorm: string) {
  const national = phoneNorm.startsWith("91") && phoneNorm.length === 12
    ? phoneNorm.slice(2)
    : phoneNorm;
  const candidates = [
    phoneNorm,
    national,
    `+${phoneNorm}`,
    `+91${national}`,
    `0${national}`,
  ];
  return prisma.seller.findFirst({
    where: {
      deletedAt: null,
      OR: candidates.map((phone) => ({ phone })),
    },
    select: SELLER_ONBOARDING_SELECT,
  });
}
