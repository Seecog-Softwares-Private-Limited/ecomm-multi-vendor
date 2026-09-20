/**
 * Authenticated Vendor Google account linking.
 * Attaches Google `sub` to the current Seller — never merges by email alone.
 */

import { prisma } from "@/lib/prisma";

export const GOOGLE_IDENTITY_ALREADY_LINKED_MESSAGE =
  "This Google account is already linked to another Vendor account.";

export const GOOGLE_ALREADY_LINKED_TO_THIS_ACCOUNT_MESSAGE =
  "Google is already connected to this Vendor account.";

export const GOOGLE_LINKED_TO_DIFFERENT_IDENTITY_MESSAGE =
  "This Vendor account is already linked to a different Google identity.";

export const VENDOR_GOOGLE_EMAIL_EXISTS_MESSAGE =
  "This email already has a Vendor account. Sign in with email and password, then connect Google from Settings → Connected Accounts.";

export class VendorGoogleLinkError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "VendorGoogleLinkError";
    this.code = code;
  }
}

export type LinkVendorGoogleResult = {
  sellerId: string;
  oauthProvider: "google";
  alreadyLinked: boolean;
};

/** Minimal Seller DB surface used by linking (injectable for unit tests). */
export type VendorGoogleLinkDb = {
  seller: {
    findFirst: (args: {
      where: Record<string, unknown>;
      select?: Record<string, boolean>;
    }) => Promise<{
      id: string;
      oauthProvider: string | null;
      oauthProviderId: string | null;
    } | null>;
    update: (args: {
      where: { id: string };
      data: {
        oauthProvider: string;
        oauthProviderId: string;
        emailVerified?: boolean;
      };
    }) => Promise<unknown>;
  };
};

/**
 * Link a verified Google `sub` to an authenticated Seller.
 * Does not change Seller.email. Does not touch Customer User.
 */
export async function linkGoogleToVendorSeller(
  sellerId: string,
  googleSub: string,
  db: VendorGoogleLinkDb = prisma
): Promise<LinkVendorGoogleResult> {
  const id = sellerId.trim();
  const sub = googleSub.trim();
  if (!id) {
    throw new VendorGoogleLinkError("Vendor authentication is required.", "VENDOR_AUTH_REQUIRED");
  }
  if (!sub) {
    throw new VendorGoogleLinkError(
      "Google identity is missing. Please try again.",
      "INVALID_GOOGLE_TOKEN"
    );
  }

  const seller = await db.seller.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      oauthProvider: true,
      oauthProviderId: true,
    },
  });
  if (!seller) {
    throw new VendorGoogleLinkError("Vendor account not found.", "VENDOR_NOT_FOUND");
  }

  if (seller.oauthProvider === "google" && seller.oauthProviderId) {
    if (seller.oauthProviderId === sub) {
      return { sellerId: seller.id, oauthProvider: "google", alreadyLinked: true };
    }
    throw new VendorGoogleLinkError(
      GOOGLE_LINKED_TO_DIFFERENT_IDENTITY_MESSAGE,
      "GOOGLE_ACCOUNT_CONFLICT"
    );
  }

  const other = await db.seller.findFirst({
    where: {
      deletedAt: null,
      oauthProvider: "google",
      oauthProviderId: sub,
      NOT: { id: seller.id },
    },
    select: { id: true },
  });
  if (other) {
    throw new VendorGoogleLinkError(
      GOOGLE_IDENTITY_ALREADY_LINKED_MESSAGE,
      "GOOGLE_IDENTITY_ALREADY_LINKED"
    );
  }

  try {
    await db.seller.update({
      where: { id: seller.id },
      data: {
        oauthProvider: "google",
        oauthProviderId: sub,
        emailVerified: true,
      },
    });
  } catch (e: unknown) {
    const code =
      e && typeof e === "object" && "code" in e ? String((e as { code: unknown }).code) : "";
    if (code === "P2002") {
      throw new VendorGoogleLinkError(
        GOOGLE_IDENTITY_ALREADY_LINKED_MESSAGE,
        "GOOGLE_IDENTITY_ALREADY_LINKED"
      );
    }
    throw e;
  }

  return { sellerId: seller.id, oauthProvider: "google", alreadyLinked: false };
}
