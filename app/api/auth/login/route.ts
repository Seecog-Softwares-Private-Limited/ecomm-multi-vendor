import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiValidationError,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  validateLogin,
  formatValidationDetails,
  verifyPassword,
  signToken,
  setAuthCookie,
} from "@/lib/auth";
import {
  CUSTOMER_ONBOARDING_SELECT,
  customerAuthStatusFields,
  syncCustomerAuthOnboardingComplete,
} from "@/lib/auth/customer-onboarding";

export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const validation = validateLogin(body);
  if (!validation.success) {
    return apiValidationError("Validation failed", formatValidationDetails(validation.errors));
  }

  const { email, password } = validation.data;

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: {
      ...CUSTOMER_ONBOARDING_SELECT,
      passwordHash: true,
    },
  });

  if (!user) {
    return apiUnauthorized("Invalid email or password");
  }

  if (!user.passwordHash) {
    return apiUnauthorized(
      "This account was created with Google or phone OTP. Please sign in using that method."
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return apiUnauthorized("Invalid email or password");
  }

  if (!user.emailVerified) {
    return apiUnauthorized(
      "Please confirm your email first. Check your inbox for the sign-up link, or resend it from the register page."
    );
  }

  const authOnboardingComplete = await syncCustomerAuthOnboardingComplete(user.id);

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  const status = customerAuthStatusFields({
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    profileCompleted: user.profileCompleted,
    authOnboardingComplete,
  });

  const response = apiSuccess({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: "CUSTOMER",
      ...status,
    },
    token,
  });

  setAuthCookie(response, token);
  return response;
});
