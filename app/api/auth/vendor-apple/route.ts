import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import {
  AppleAuthError,
  isApplePrivateRelayEmail,
  resolveAppleVendorMatch,
  verifyAppleIdentityToken,
} from "@/lib/auth/apple";

const NO_VENDOR_MESSAGE =
  "No vendor account exists for this Apple account. Please register as a vendor first.";

type AppleFullName = {
  givenName?: string | null;
  familyName?: string | null;
};

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function composeOwnerName(fullName: unknown, current: string): string | undefined {
  if (!fullName || typeof fullName !== "object") return undefined;
  const name = fullName as AppleFullName;
  const given = readString(name.givenName);
  const family = readString(name.familyName);
  const composed = `${given} ${family}`.trim();
  if (!composed) return undefined;
  if (!current.trim()) return composed;
  return undefined;
}

/**
 * POST /api/auth/vendor-apple
 *
 * Verifies a native Sign in with Apple identity token from the Vendor iOS app,
 * finds an existing Seller (never auto-creates), and sets the same auth_token
 * cookie used by email/password and Google vendor login.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  if (!body || typeof body !== "object") {
    return apiBadRequest("Invalid JSON body");
  }

  const record = body as Record<string, unknown>;
  const identityToken = readString(record.identityToken);
  const nonce = readString(record.nonce);
  if (!identityToken || !nonce) {
    return apiBadRequest("Apple sign-in is missing required credentials");
  }

  let claims;
  try {
    claims = await verifyAppleIdentityToken(identityToken, nonce);
  } catch (err) {
    if (err instanceof AppleAuthError) {
      return apiUnauthorized("Apple sign-in could not be verified. Please try again.");
    }
    console.error("[Vendor Apple] identity token verification failed");
    return apiUnauthorized("Apple sign-in could not be verified. Please try again.");
  }

  const appleUserId = claims.sub;
  const verifiedRealEmail =
    claims.email && claims.emailVerified && !claims.isPrivateRelay && !isApplePrivateRelayEmail(claims.email)
      ? claims.email
      : null;

  const sellerSelect = {
    id: true,
    email: true,
    businessName: true,
    ownerName: true,
    status: true,
    appleUserId: true,
  } as const;

  const byAppleSub = await prisma.seller.findFirst({
    where: { appleUserId, deletedAt: null },
    select: sellerSelect,
  });

  const byEmail = verifiedRealEmail
    ? await prisma.seller.findFirst({
        where: { email: verifiedRealEmail, deletedAt: null },
        select: sellerSelect,
      })
    : null;

  const match = resolveAppleVendorMatch({
    appleUserId,
    verifiedRealEmail,
    byAppleSub,
    byEmail,
  });

  if (match.action === "conflict") {
    return apiUnauthorized(
      "This vendor email is already linked to a different Apple ID. Use email and password or Google to sign in."
    );
  }

  if (match.action === "register") {
    return apiUnauthorized(NO_VENDOR_MESSAGE);
  }

  let seller = byAppleSub?.id === match.sellerId ? byAppleSub : byEmail;
  if (!seller || seller.id !== match.sellerId) {
    return apiUnauthorized(NO_VENDOR_MESSAGE);
  }

  const ownerName = composeOwnerName(record.fullName, seller.ownerName);
  if (match.linkApple || ownerName) {
    seller = await prisma.seller.update({
      where: { id: seller.id },
      data: {
        ...(match.linkApple
          ? {
              appleUserId,
              emailVerified: true,
              verificationToken: null,
              verificationTokenExpires: null,
            }
          : {}),
        ...(ownerName ? { ownerName } : {}),
      },
      select: sellerSelect,
    });
  }

  const token = await signToken({
    sub: seller.id,
    email: seller.email,
    role: "SELLER",
  });

  const response = apiSuccess({
    vendor: {
      id: seller.id,
      email: seller.email,
      businessName: seller.businessName,
      ownerName: seller.ownerName,
      status: seller.status,
      role: "SELLER",
    },
  });

  setAuthCookie(response, token);
  return response;
});
