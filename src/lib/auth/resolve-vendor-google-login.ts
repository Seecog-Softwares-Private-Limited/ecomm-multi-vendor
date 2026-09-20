/**
 * Vendor Google identity resolution for login (not the Settings "Connect Google" flow).
 *
 * Lookup order: Google `sub` first, then verified Google email → existing Seller.
 * When Google asserts `email_verified=true` and an active Seller owns that email
 * (with no conflicting Google identity), we auto-link `sub` and log in — even if
 * Seller.emailVerified was still false (Google's attestation upgrades trust;
 * linking sets emailVerified=true). Customer User is never queried.
 */

import { prisma } from "@/lib/prisma";
import {
  createSocialVendor,
  SocialVendorCreateError,
  type CreatedSocialVendor,
} from "@/lib/auth/create-social-vendor";
import {
  linkGoogleToVendorSeller,
  VendorGoogleLinkError,
  GOOGLE_IDENTITY_ALREADY_LINKED_MESSAGE,
  GOOGLE_LINKED_TO_DIFFERENT_IDENTITY_MESSAGE,
  VENDOR_GOOGLE_EMAIL_EXISTS_MESSAGE,
} from "@/lib/auth/link-vendor-google";

const VENDOR_GOOGLE_SELECT = {
  id: true,
  email: true,
  emailVerified: true,
  oauthProvider: true,
  oauthProviderId: true,
  businessName: true,
  ownerName: true,
  status: true,
  authOnboardingComplete: true,
  phoneVerified: true,
  phone: true,
  passwordHash: true,
} as const;

export type SellerGoogleLookup = {
  id: string;
  email: string;
  emailVerified: boolean;
  oauthProvider: string | null;
  oauthProviderId: string | null;
};

export type VendorGoogleMatch =
  | { action: "login"; sellerId: string; linkGoogle: boolean }
  | { action: "conflict"; code: string; message: string }
  | { action: "register" };

/**
 * Pure decision: how a verified Google identity maps to existing Sellers.
 * Does not read Customer User. Does not move a `sub` between Sellers.
 */
export function resolveVendorGoogleMatch(input: {
  googleSub: string;
  googleEmailVerified: boolean;
  byGoogleSub: SellerGoogleLookup | null;
  byEmail: SellerGoogleLookup | null;
}): VendorGoogleMatch {
  const sub = input.googleSub.trim();
  const { googleEmailVerified, byGoogleSub, byEmail } = input;

  // Scenario 3: Google sub is Seller A, verified email is Seller B — no merge.
  if (byGoogleSub && byEmail && byGoogleSub.id !== byEmail.id) {
    return {
      action: "conflict",
      code: "GOOGLE_ACCOUNT_CONFLICT",
      message: GOOGLE_IDENTITY_ALREADY_LINKED_MESSAGE,
    };
  }

  if (byGoogleSub) {
    return { action: "login", sellerId: byGoogleSub.id, linkGoogle: false };
  }

  if (byEmail) {
    if (
      byEmail.oauthProvider === "google" &&
      byEmail.oauthProviderId &&
      byEmail.oauthProviderId !== sub
    ) {
      return {
        action: "conflict",
        code: "GOOGLE_ACCOUNT_CONFLICT",
        message: GOOGLE_LINKED_TO_DIFFERENT_IDENTITY_MESSAGE,
      };
    }

    // Require Google-asserted email_verified before using email as a lookup key.
    // Seller.emailVerified may still be false for password signups — Google's
    // verified address is enough to attach sub (link step sets emailVerified).
    if (!googleEmailVerified) {
      return {
        action: "conflict",
        code: "SOCIAL_EMAIL_CONFLICT",
        message: VENDOR_GOOGLE_EMAIL_EXISTS_MESSAGE,
      };
    }

    return { action: "login", sellerId: byEmail.id, linkGoogle: true };
  }

  return { action: "register" };
}

export type ApplyVendorGoogleLoginResult =
  | { ok: true; seller: CreatedSocialVendor; isNew: boolean }
  | { ok: false; message: string; code: string };

/**
 * Resolve-or-create the Vendor Seller for a Google login.
 * Looks up Seller only. Never accepts sellerId from the client.
 */
export async function applyVendorGoogleLogin(input: {
  googleSub: string;
  email: string;
  googleEmailVerified: boolean;
  name?: string | null;
}): Promise<ApplyVendorGoogleLoginResult> {
  const googleSub = input.googleSub.trim();
  const email = input.email.trim().toLowerCase();
  if (!googleSub) {
    return {
      ok: false,
      message: "Google identity is missing. Please try again.",
      code: "NO_PROVIDER_ID",
    };
  }
  if (!email) {
    return {
      ok: false,
      message: "Your Google account has no email address. Use email and password instead.",
      code: "NO_EMAIL",
    };
  }

  const byGoogleSub = await prisma.seller.findFirst({
    where: {
      deletedAt: null,
      oauthProvider: "google",
      oauthProviderId: googleSub,
    },
    select: VENDOR_GOOGLE_SELECT,
  });

  const byEmail = await prisma.seller.findFirst({
    where: { email, deletedAt: null },
    select: VENDOR_GOOGLE_SELECT,
  });

  const match = resolveVendorGoogleMatch({
    googleSub,
    googleEmailVerified: input.googleEmailVerified === true,
    byGoogleSub,
    byEmail,
  });

  // #region agent log
  fetch('http://127.0.0.1:7456/ingest/072b8280-cbe0-406c-9e62-41143fb8780b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'337f7e'},body:JSON.stringify({sessionId:'337f7e',runId:'post-fix',hypothesisId:'A',location:'resolve-vendor-google-login.ts:match',message:'resolveVendorGoogleMatch decision',data:{action:match.action,code:match.action==='conflict'?match.code:null,googleEmailVerified:input.googleEmailVerified===true,byGoogleSubFound:Boolean(byGoogleSub),byEmailFound:Boolean(byEmail),sellerEmailVerified:byEmail?byEmail.emailVerified===true:null,sellerHasOauth:byEmail?Boolean(byEmail.oauthProviderId):null,sellerIdPrefix:byEmail?String(byEmail.id).slice(0,8):null,linkGoogle:match.action==='login'?match.linkGoogle:null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (match.action === "conflict") {
    return { ok: false, message: match.message, code: match.code };
  }

  if (match.action === "login") {
    if (match.linkGoogle) {
      try {
        await linkGoogleToVendorSeller(match.sellerId, googleSub);
      } catch (err) {
        if (err instanceof VendorGoogleLinkError) {
          return { ok: false, message: err.message, code: err.code };
        }
        throw err;
      }
    }

    const seller = await prisma.seller.findFirst({
      where: { id: match.sellerId, deletedAt: null },
      select: {
        id: true,
        email: true,
        businessName: true,
        ownerName: true,
        status: true,
        authOnboardingComplete: true,
        phoneVerified: true,
        emailVerified: true,
      },
    });
    if (!seller) {
      return { ok: false, message: "Vendor account not found.", code: "VENDOR_NOT_FOUND" };
    }
    return { ok: true, seller, isNew: false };
  }

  try {
    const created = await createSocialVendor({
      email,
      name: input.name,
      provider: "google",
      oauthProviderId: googleSub,
    });
    return { ok: true, seller: created, isNew: true };
  } catch (err) {
    if (err instanceof SocialVendorCreateError) {
      return { ok: false, message: err.message, code: err.code };
    }
    throw err;
  }
}
