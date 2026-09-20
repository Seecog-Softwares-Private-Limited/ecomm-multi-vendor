import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  apiError,
  Status,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import {
  GoogleAuthError,
  isGoogleIdTokenAuthConfigured,
  verifyGoogleIdToken,
} from "@/lib/auth/google-id-token";
import {
  linkGoogleToVendorSeller,
  VendorGoogleLinkError,
} from "@/lib/auth/link-vendor-google";

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * POST /api/auth/vendor/link-google
 *
 * Authenticated Vendor links Google via ID token.
 * Body: { idToken: string }
 * Seller identity comes only from the session JWT — never from the body.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  if (!isGoogleIdTokenAuthConfigured()) {
    return apiError(
      "Google sign-in is not configured on the server.",
      Status.SERVICE_UNAVAILABLE,
      "GOOGLE_NOT_CONFIGURED"
    );
  }

  let session;
  try {
    session = await requireSession(request);
  } catch {
    return apiUnauthorized("Sign in to your Vendor account before connecting Google.");
  }
  if (session.role !== "SELLER") {
    return apiForbidden("Vendor access required");
  }
  const sellerId = session.sub?.trim() ?? "";
  if (!sellerId) {
    return apiUnauthorized("Sign in to your Vendor account before connecting Google.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (!body || typeof body !== "object") {
    return apiBadRequest("Invalid JSON body");
  }

  const idToken = readString((body as Record<string, unknown>).idToken);
  if (!idToken) {
    return apiBadRequest("Google sign-in is missing required credentials");
  }

  let claims;
  try {
    claims = await verifyGoogleIdToken(idToken);
  } catch (err) {
    if (err instanceof GoogleAuthError) {
      return apiError(err.message, Status.UNAUTHORIZED, "INVALID_GOOGLE_TOKEN");
    }
    return apiError(
      "Google sign-in could not be verified. Please try again.",
      Status.UNAUTHORIZED,
      "INVALID_GOOGLE_TOKEN"
    );
  }

  try {
    const result = await linkGoogleToVendorSeller(sellerId, claims.sub);
    return apiSuccess({
      linked: true,
      alreadyLinked: result.alreadyLinked,
      oauthProvider: result.oauthProvider,
      message: result.alreadyLinked
        ? "Google is already connected to this Vendor account."
        : "Google connected successfully. You can sign in with Google or email and password.",
    });
  } catch (err) {
    if (err instanceof VendorGoogleLinkError) {
      if (
        err.code === "GOOGLE_IDENTITY_ALREADY_LINKED" ||
        err.code === "GOOGLE_ACCOUNT_CONFLICT"
      ) {
        return apiError(err.message, Status.CONFLICT, err.code);
      }
      if (err.code === "VENDOR_AUTH_REQUIRED" || err.code === "VENDOR_NOT_FOUND") {
        return apiError(err.message, Status.UNAUTHORIZED, err.code);
      }
      return apiError(err.message, Status.BAD_REQUEST, err.code);
    }
    throw err;
  }
});
