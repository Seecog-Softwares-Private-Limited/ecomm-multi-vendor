import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
  apiConflict,
  apiNotFound,
  apiValidationError,
} from "@/lib/api";
import {
  getSession,
  formatValidationDetails,
  validateCustomerOnboardingProfile,
  signToken,
  setAuthCookie,
} from "@/lib/auth";
import { completePhoneFirstOnboarding } from "@/lib/auth/complete-phone-onboarding";

/**
 * POST /api/auth/onboarding/profile
 *
 * Phone-first onboarding: authenticated incomplete customer submits name + real email.
 * Replaces placeholder email, sends existing verification link, does not set a password.
 * Body: { name? | firstName?/lastName?, email }
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Not authenticated");
  if (session.role !== "CUSTOMER") {
    return apiForbidden("Only customer accounts can complete this onboarding step.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  if (typeof body !== "object" || body === null) {
    return apiBadRequest("Body must be an object.");
  }

  const b = body as Record<string, unknown>;
  if ("password" in b && b.password != null && b.password !== "") {
    return apiBadRequest("Password is not accepted on this endpoint.");
  }
  if ("phone" in b && b.phone != null && String(b.phone).trim() !== "") {
    return apiBadRequest(
      "Phone cannot be changed here. Use phone OTP to verify a number."
    );
  }
  if ("userId" in b) {
    return apiBadRequest("Do not send userId; your session identifies the account.");
  }

  const validation = validateCustomerOnboardingProfile(body);
  if (!validation.success) {
    return apiValidationError(
      "Validation failed",
      formatValidationDetails(validation.errors)
    );
  }

  const result = await completePhoneFirstOnboarding(session.sub, validation.data);

  if (!result.ok) {
    if (result.kind === "not_found") return apiNotFound("User not found");
    if (result.kind === "email_conflict") return apiConflict(result.message);
    if (result.kind === "phone_not_verified") return apiBadRequest(result.message);
    return apiBadRequest(result.message);
  }

  const token = await signToken({
    sub: result.user.id,
    email: result.user.email,
    role: "CUSTOMER",
  });

  const response = apiSuccess({
    message: result.needsEmailVerification
      ? "Profile saved. Enter the OTP we send to your email to verify your address."
      : "Profile updated.",
    needsEmailVerification: result.needsEmailVerification,
    emailSent: false,
    user: result.user,
    token,
  });
  setAuthCookie(response, token);
  return response;
});
