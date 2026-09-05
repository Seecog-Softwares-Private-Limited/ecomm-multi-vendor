import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiError,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import {
  AppleAuthError,
  isApplePrivateRelayEmail,
  resolveAppleVendorMatch,
  verifyAppleIdentityToken,
} from "@/lib/auth/apple";
import { createSocialVendor, SocialVendorCreateError } from "@/lib/auth/create-social-vendor";

const NO_VENDOR_MESSAGE =
  "No vendor account exists for this Apple account. Please register as a vendor first.";
/** Stable code so the client can route to vendor registration instead of a dead-end error. */
const NOT_REGISTERED_CODE = "VENDOR_NOT_REGISTERED";

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
 * finds an existing Seller or auto-creates one, and sets the same auth_token
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

  const composedName = composeOwnerName(record.fullName, "") ?? "";
  // Apple returns email on first authorization (real or private relay). Later
  // sign-ins often omit email — those are resolved via appleUserId above.
  const accountEmail = verifiedRealEmail ?? claims.email ?? null;

  // No vendor account yet → auto-create one linked to this Apple ID and sign in.
  // (Guideline 2.1 — social sign-in must not dead-end.) The vendor lands in the
  // onboarding/KYC flow and must set a real business name before being approved.
  if (match.action === "register") {
    if (!accountEmail) {
      // Extremely rare: Apple withheld any email — fall back to registration.
      return apiError(NO_VENDOR_MESSAGE, Status.UNAUTHORIZED, NOT_REGISTERED_CODE, {
        email: "",
        name: composedName,
      });
    }

    try {
      const created = await createSocialVendor({
        email: accountEmail,
        name: composedName,
        provider: "apple",
        appleUserId,
      });

      const newToken = await signToken({
        sub: created.id,
        email: created.email,
        role: "SELLER",
      });
      const createdResponse = apiSuccess({
        vendor: {
          id: created.id,
          email: created.email,
          businessName: created.businessName,
          ownerName: created.ownerName,
          status: created.status,
          role: "SELLER",
        },
      });
      setAuthCookie(createdResponse, newToken);
      return createdResponse;
    } catch (err) {
      if (err instanceof SocialVendorCreateError) {
        return apiUnauthorized(err.message);
      }
      throw err;
    }
  }

  // match.action === "login" (conflict already returned above)
  let seller = byAppleSub?.id === match.sellerId ? byAppleSub : byEmail;
  if (!seller || seller.id !== match.sellerId) {
    // Defensive: should not happen when action is login.
    return apiError(NO_VENDOR_MESSAGE, Status.UNAUTHORIZED, NOT_REGISTERED_CODE, {
      email: accountEmail ?? "",
      name: composedName,
    });
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
