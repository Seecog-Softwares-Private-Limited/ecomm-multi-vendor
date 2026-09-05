import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export type SocialVendorProvider = "apple" | "google";

const CREATED_SELLER_SELECT = {
  id: true,
  email: true,
  businessName: true,
  ownerName: true,
  status: true,
} as const;

export type CreatedSocialVendor = {
  id: string;
  email: string;
  businessName: string;
  ownerName: string;
  status: string;
};

export class SocialVendorCreateError extends Error {
  readonly code: string;

  constructor(message: string, code = "SOCIAL_VENDOR_CREATE_FAILED") {
    super(message);
    this.name = "SocialVendorCreateError";
    this.code = code;
  }
}

function emailLocalPart(email: string): string {
  const local = String(email).split("@")[0]?.trim() ?? "";
  // Keep business/owner names within VarChar(255) and readable.
  return (local || "vendor").slice(0, 80);
}

/**
 * Derive display names for a vendor auto-created from a social identity.
 * Apple/Google never provide a business/store name, so we seed a placeholder
 * (the person's name, else the email handle). The seller must set the real
 * business name during onboarding before the account can be approved to sell.
 */
function deriveNames(email: string, name?: string | null): {
  ownerName: string;
  businessName: string;
} {
  const clean = (name ?? "").trim().slice(0, 255);
  const ownerName = clean || emailLocalPart(email);
  return { ownerName, businessName: ownerName.slice(0, 255) };
}

async function findActiveSeller(opts: {
  email: string;
  appleUserId?: string | null;
}): Promise<CreatedSocialVendor | null> {
  if (opts.appleUserId) {
    const byApple = await prisma.seller.findFirst({
      where: { appleUserId: opts.appleUserId, deletedAt: null },
      select: CREATED_SELLER_SELECT,
    });
    if (byApple) return byApple;
  }
  return prisma.seller.findFirst({
    where: { email: opts.email, deletedAt: null },
    select: CREATED_SELLER_SELECT,
  });
}

/**
 * Auto-create a vendor (Seller) from an Apple/Google sign-in when no account
 * exists yet. Email is treated as provider-verified. Created in DRAFT status so
 * the vendor lands in the "Complete profile & KYC" onboarding flow — product
 * publishing stays blocked until an admin approves the completed profile.
 *
 * Handles race conditions and soft-deleted email/Apple-ID collisions by either
 * returning the existing active seller or throwing a clear SocialVendorCreateError.
 */
export async function createSocialVendor(opts: {
  email: string;
  name?: string | null;
  provider: SocialVendorProvider;
  appleUserId?: string | null;
  oauthProviderId?: string | null;
}): Promise<CreatedSocialVendor> {
  const email = opts.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new SocialVendorCreateError(
      "A verified email is required to create a vendor account.",
      "SOCIAL_EMAIL_REQUIRED"
    );
  }

  // Idempotent: if another request already created the account, reuse it.
  const existing = await findActiveSeller({
    email,
    appleUserId: opts.appleUserId,
  });
  if (existing) return existing;

  const { ownerName, businessName } = deriveNames(email, opts.name);
  // passwordHash is required by the schema; social vendors sign in via the
  // provider, so seed an unusable random password they can later reset.
  const passwordHash = await hashPassword(`${randomBytes(24).toString("hex")}Aa1!`);

  try {
    return await prisma.seller.create({
      data: {
        email,
        passwordHash,
        businessName,
        ownerName,
        status: "DRAFT",
        emailVerified: true,
        oauthProvider: opts.provider,
        oauthProviderId: opts.oauthProviderId ?? null,
        appleUserId: opts.provider === "apple" ? opts.appleUserId ?? null : null,
      },
      select: CREATED_SELLER_SELECT,
    });
  } catch (err) {
    // Concurrent double-tap: another request won the unique race — reuse it.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const raced = await findActiveSeller({
        email,
        appleUserId: opts.appleUserId,
      });
      if (raced) return raced;

      // Soft-deleted row still owns the unique email / appleUserId.
      throw new SocialVendorCreateError(
        "This email was previously used for a deactivated vendor account. Contact support to reactivate, or use a different email.",
        "SOCIAL_VENDOR_DEACTIVATED"
      );
    }
    throw err;
  }
}
