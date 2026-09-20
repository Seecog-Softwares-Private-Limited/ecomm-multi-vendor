import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SellerStatus } from "@prisma/client";
import { VENDOR_GOOGLE_EMAIL_EXISTS_MESSAGE } from "@/lib/auth/link-vendor-google";

export type SocialVendorProvider = "apple" | "google";

const CREATED_SELLER_SELECT = {
  id: true,
  email: true,
  businessName: true,
  ownerName: true,
  status: true,
  authOnboardingComplete: true,
  phoneVerified: true,
  emailVerified: true,
} as const;

export type CreatedSocialVendor = {
  id: string;
  email: string;
  businessName: string;
  ownerName: string;
  status: string;
  authOnboardingComplete?: boolean;
  phoneVerified?: boolean;
  emailVerified?: boolean;
};

export class SocialVendorCreateError extends Error {
  readonly code: string;

  constructor(message: string, code = "SOCIAL_VENDOR_CREATE_FAILED") {
    super(message);
    this.name = "SocialVendorCreateError";
    this.code = code;
  }
}

export const SOCIAL_EMAIL_CONFLICT_MESSAGE = VENDOR_GOOGLE_EMAIL_EXISTS_MESSAGE;

export const SOCIAL_APPLE_EMAIL_CONFLICT_MESSAGE =
  "This email is already registered with another account. Please log in to that account first. You can link Apple later.";

function emailLocalPart(email: string): string {
  const local = String(email).split("@")[0]?.trim() ?? "";
  return (local || "vendor").slice(0, 80);
}

function deriveNames(
  email: string,
  name?: string | null
): { ownerName: string; businessName: string } {
  const clean = (name ?? "").trim().slice(0, 255);
  const ownerName = clean || emailLocalPart(email);
  return { ownerName, businessName: ownerName.slice(0, 255) };
}

/**
 * Auto-create a vendor (Seller) from Apple/Google when no account exists.
 * No synthetic password — passwordHash stays null.
 * Created incomplete until phone OTP completes auth onboarding.
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

  if (opts.provider === "google" && !opts.oauthProviderId?.trim()) {
    throw new SocialVendorCreateError(
      "Google identity is missing. Please try again.",
      "SOCIAL_PROVIDER_ID_REQUIRED"
    );
  }
  if (opts.provider === "apple" && !opts.appleUserId?.trim()) {
    throw new SocialVendorCreateError(
      "Apple identity is missing. Please try again.",
      "SOCIAL_PROVIDER_ID_REQUIRED"
    );
  }

  // Resolve by provider ID first (never email alone).
  if (opts.provider === "google" && opts.oauthProviderId) {
    const byOauth = await prisma.seller.findFirst({
      where: {
        deletedAt: null,
        oauthProvider: "google",
        oauthProviderId: opts.oauthProviderId,
      },
      select: CREATED_SELLER_SELECT,
    });
    if (byOauth) return byOauth;
  }
  if (opts.provider === "apple" && opts.appleUserId) {
    const byApple = await prisma.seller.findFirst({
      where: { deletedAt: null, appleUserId: opts.appleUserId },
      select: CREATED_SELLER_SELECT,
    });
    if (byApple) return byApple;
  }

  const emailOwner = await prisma.seller.findFirst({
    where: { email, deletedAt: null },
    select: { id: true },
  });
  if (emailOwner) {
    // #region agent log
    fetch('http://127.0.0.1:7456/ingest/072b8280-cbe0-406c-9e62-41143fb8780b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'337f7e'},body:JSON.stringify({sessionId:'337f7e',runId:'pre-fix',hypothesisId:'E',location:'create-social-vendor.ts:email-conflict',message:'createSocialVendor email conflict path hit',data:{provider:opts.provider,emailOwnerIdPrefix:String(emailOwner.id).slice(0,8)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw new SocialVendorCreateError(
      opts.provider === "apple"
        ? SOCIAL_APPLE_EMAIL_CONFLICT_MESSAGE
        : SOCIAL_EMAIL_CONFLICT_MESSAGE,
      "SOCIAL_EMAIL_CONFLICT"
    );
  }

  const { ownerName, businessName } = deriveNames(email, opts.name);

  try {
    return await prisma.seller.create({
      data: {
        email,
        passwordHash: null,
        businessName,
        ownerName,
        status: SellerStatus.DRAFT,
        emailVerified: true,
        phoneVerified: false,
        authOnboardingComplete: false,
        oauthProvider: opts.provider === "google" ? "google" : null,
        oauthProviderId: opts.provider === "google" ? opts.oauthProviderId ?? null : null,
        appleUserId: opts.provider === "apple" ? opts.appleUserId ?? null : null,
      },
      select: CREATED_SELLER_SELECT,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      if (opts.provider === "google" && opts.oauthProviderId) {
        const raced = await prisma.seller.findFirst({
          where: {
            deletedAt: null,
            oauthProvider: "google",
            oauthProviderId: opts.oauthProviderId,
          },
          select: CREATED_SELLER_SELECT,
        });
        if (raced) return raced;
      }
      if (opts.provider === "apple" && opts.appleUserId) {
        const raced = await prisma.seller.findFirst({
          where: { deletedAt: null, appleUserId: opts.appleUserId },
          select: CREATED_SELLER_SELECT,
        });
        if (raced) return raced;
      }
      throw new SocialVendorCreateError(
        opts.provider === "apple"
          ? SOCIAL_APPLE_EMAIL_CONFLICT_MESSAGE
          : SOCIAL_EMAIL_CONFLICT_MESSAGE,
        "SOCIAL_EMAIL_CONFLICT"
      );
    }
    throw err;
  }
}
