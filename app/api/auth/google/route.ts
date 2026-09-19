import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiConflict,
  apiError,
  Status,
} from "@/lib/api";
import { setAuthCookie } from "@/lib/auth";
import { completeCustomerSocialLogin } from "@/lib/auth/complete-customer-google";
import {
  GoogleAuthError,
  isGoogleIdTokenAuthConfigured,
  verifyGoogleIdToken,
} from "@/lib/auth/google-id-token";

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * POST /api/auth/google
 *
 * Native customer Google Sign-in: verify Google ID token, find-or-create User,
 * return the same `{ user, token }` shape as email/password login.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  if (!isGoogleIdTokenAuthConfigured()) {
    return apiError(
      "Google sign-in is not configured. Set GOOGLE_CLIENT_ID (and optionally GOOGLE_ANDROID_CLIENT_ID / GOOGLE_IOS_CLIENT_ID).",
      Status.SERVICE_UNAVAILABLE,
      "GOOGLE_NOT_CONFIGURED"
    );
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
      if (err.code === "GOOGLE_EMAIL_MISSING") {
        return apiBadRequest(err.message);
      }
      if (err.code === "GOOGLE_NOT_CONFIGURED") {
        return apiError(err.message, Status.SERVICE_UNAVAILABLE, err.code);
      }
      return apiUnauthorized("Google sign-in could not be verified. Please try again.");
    }
    console.error("[Customer Google] ID token verification failed");
    return apiUnauthorized("Google sign-in could not be verified. Please try again.");
  }

  const result = await completeCustomerSocialLogin("google", {
    providerId: claims.sub,
    email: claims.email,
    firstName: claims.firstName,
    lastName: claims.lastName,
    avatarUrl: claims.avatarUrl,
  });

  if (!result.ok) {
    if (result.code === "EMAIL_CONFLICT") {
      return apiConflict(result.error);
    }
    return apiBadRequest(result.error);
  }

  const response = apiSuccess({
    user: result.user,
    token: result.token,
  });
  setAuthCookie(response, result.token);
  return response;
});
