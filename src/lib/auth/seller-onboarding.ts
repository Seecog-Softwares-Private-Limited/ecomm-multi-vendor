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

import { Prisma, SellerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone, toIndianMobile10Digits } from "@/lib/auth/phone";

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

export type SellerOnboardingRow = Prisma.SellerGetPayload<{
  select: typeof SELLER_ONBOARDING_SELECT;
}>;

export const PHONE_ACCOUNT_CONFLICT_CODE = "PHONE_ACCOUNT_CONFLICT";
export const PHONE_ACCOUNT_CONFLICT_MESSAGE =
  "This phone number is associated with multiple vendor accounts and requires resolution. Please contact support.";

export type ActiveSellerPhoneResolution =
  | { kind: "none" }
  | { kind: "one"; seller: SellerOnboardingRow }
  | { kind: "conflict"; sellers: SellerOnboardingRow[] };

export type EnsureVendorPhoneSellerResult =
  | { kind: "ok"; seller: SellerOnboardingRow; created: boolean }
  | { kind: "conflict"; sellers: SellerOnboardingRow[] };

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
 * Whether a stored Seller.phone value is the same Indian mobile as `phoneNorm`
 * (`91` + 10-digit national). Uses the shared `normalizeIndianPhone` helper so
 * `+91…`, `91…`, and 10-digit forms all match.
 */
export function sellerStoredPhoneMatchesNorm(
  stored: string | null | undefined,
  phoneNorm: string
): boolean {
  if (!stored?.trim()) return false;
  return normalizeIndianPhone(stored) === phoneNorm;
}

/** Exact DB strings commonly used for a normalized `91xxxxxxxxxx` phone. */
export function vendorPhoneLookupCandidates(phoneNorm: string): string[] {
  const national = toIndianMobile10Digits(phoneNorm);
  return [...new Set([
    phoneNorm,
    national,
    `+${phoneNorm}`,
    `+91${national}`,
    `0${national}`,
  ])];
}

/**
 * All active (non-deleted) sellers whose phone normalizes to `phoneNorm`.
 * Seller.phone is not unique; callers must handle 0 / 1 / many.
 * Does not query Customer `User`.
 */
export async function findActiveSellersByPhoneNorm(
  phoneNorm: string
): Promise<SellerOnboardingRow[]> {
  const national = toIndianMobile10Digits(phoneNorm);
  const candidates = vendorPhoneLookupCandidates(phoneNorm);

  const rows = await prisma.seller.findMany({
    where: {
      deletedAt: null,
      OR: [
        { phone: { in: candidates } },
        { phone: { endsWith: national } },
      ],
    },
    select: SELLER_ONBOARDING_SELECT,
  });

  const seen = new Set<string>();
  const matched: SellerOnboardingRow[] = [];
  for (const row of rows) {
    if (!sellerStoredPhoneMatchesNorm(row.phone, phoneNorm)) continue;
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    matched.push(row);
  }
  return matched;
}

export async function resolveActiveSellerByPhoneNorm(
  phoneNorm: string
): Promise<ActiveSellerPhoneResolution> {
  const sellers = await findActiveSellersByPhoneNorm(phoneNorm);
  if (sellers.length === 0) return { kind: "none" };
  if (sellers.length === 1) return { kind: "one", seller: sellers[0] };
  return { kind: "conflict", sellers };
}

/**
 * Find a single active seller by normalized Indian phone.
 * If multiple active sellers share the number, returns the first match only —
 * prefer `resolveActiveSellerByPhoneNorm` for OTP login (conflict-aware).
 */
export async function findActiveSellerByPhoneNorm(phoneNorm: string) {
  const sellers = await findActiveSellersByPhoneNorm(phoneNorm);
  return sellers[0] ?? null;
}

async function createIncompletePhoneFirstSeller(
  phoneNorm: string
): Promise<SellerOnboardingRow> {
  const email = placeholderEmailForVendorPhoneNorm(phoneNorm);
  return prisma.seller.create({
    data: {
      email,
      passwordHash: null,
      businessName: "Pending",
      ownerName: "Pending",
      phone: phoneNorm,
      status: SellerStatus.DRAFT,
      emailVerified: false,
      phoneVerified: false,
      authOnboardingComplete: false,
    },
    select: SELLER_ONBOARDING_SELECT,
  });
}

/**
 * OTP send: reuse the single active seller for this phone, or create a new
 * incomplete phone-first seller when none exists. Never picks randomly among
 * duplicates — returns `conflict` instead.
 */
export async function ensureSellerForVendorPhoneOtp(
  phoneNorm: string
): Promise<EnsureVendorPhoneSellerResult> {
  const existing = await resolveActiveSellerByPhoneNorm(phoneNorm);
  if (existing.kind === "conflict") return existing;
  if (existing.kind === "one") {
    return { kind: "ok", seller: existing.seller, created: false };
  }

  try {
    const created = await createIncompletePhoneFirstSeller(phoneNorm);
    return { kind: "ok", seller: created, created: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const raced = await resolveActiveSellerByPhoneNorm(phoneNorm);
      if (raced.kind === "one") {
        return { kind: "ok", seller: raced.seller, created: false };
      }
      if (raced.kind === "conflict") return raced;
    }
    throw err;
  }
}

/**
 * After a valid OTP: mark this seller's phone verified and canonicalize
 * `phone` to `phoneNorm`. Does not touch email, password, OAuth, KYC, or status.
 */
export async function markSellerPhoneOtpVerified(
  sellerId: string,
  phoneNorm: string
): Promise<boolean> {
  await prisma.seller.update({
    where: { id: sellerId },
    data: {
      phone: phoneNorm,
      phoneVerified: true,
      phoneOtpCode: null,
      phoneOtpExpires: null,
    },
  });
  return syncSellerAuthOnboardingComplete(sellerId);
}
