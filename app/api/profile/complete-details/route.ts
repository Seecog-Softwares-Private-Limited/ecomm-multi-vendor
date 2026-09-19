import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
  apiConflict,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { completeProfileDetails } from "@/lib/profile/complete-details";
import {
  CUSTOMER_ONBOARDING_SELECT,
  customerAuthStatusFields,
  syncCustomerAuthOnboardingComplete,
} from "@/lib/auth/customer-onboarding";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/profile/complete-details
 * Saves a mobile number (unverified) and optional name fields after login.
 * Does NOT mark phoneVerified — use phone OTP for verification (Phase 3).
 * Body: { phone: string, firstName?: string, lastName?: string, skipOptional?: boolean }
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Not authenticated");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customer accounts use this step.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) return apiBadRequest("Body must be an object.");

  const b = body as Record<string, unknown>;
  const phone = typeof b.phone === "string" ? b.phone : "";
  if (!phone.trim()) return apiBadRequest("Mobile number is required.");

  const firstName = typeof b.firstName === "string" ? b.firstName : undefined;
  const lastName = typeof b.lastName === "string" ? b.lastName : undefined;
  const skipOptional = b.skipOptional === true;

  const { error } = await completeProfileDetails(session.sub, {
    phone,
    firstName,
    lastName,
    skipOptional,
  });
  if (error) {
    if (error.includes("already registered") || error.includes("already used")) {
      return apiConflict(error);
    }
    return apiBadRequest(error);
  }

  const authOnboardingComplete = await syncCustomerAuthOnboardingComplete(session.sub);
  const user = await prisma.user.findFirst({
    where: { id: session.sub, deletedAt: null },
    select: CUSTOMER_ONBOARDING_SELECT,
  });

  return apiSuccess({
    message: "Profile saved. Verify your phone with OTP to complete onboarding.",
    profileCompleted: user?.profileCompleted ?? true,
    phoneVerified: user?.phoneVerified ?? false,
    authOnboardingComplete,
    needsAuthOnboarding: !authOnboardingComplete,
    ...(user
      ? {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            ...customerAuthStatusFields({
              phone: user.phone,
              phoneVerified: user.phoneVerified,
              profileCompleted: user.profileCompleted,
              authOnboardingComplete,
            }),
          },
        }
      : {}),
  });
});
