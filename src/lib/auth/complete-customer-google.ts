/**
 * Shared customer Google identity resolution for:
 * - Web OAuth callback (`/api/auth/oauth/google/callback`)
 * - Native ID-token exchange (`POST /api/auth/google`)
 */

import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth/jwt";
import { queueGoogleOAuthWelcomeEmail } from "@/lib/email/oauth-google-welcome";
import {
  CUSTOMER_ONBOARDING_SELECT,
  customerAuthStatusFields,
  syncCustomerAuthOnboardingComplete,
} from "@/lib/auth/customer-onboarding";
import type { OAuthProvider } from "@/lib/auth/oauth";

export type CustomerSocialProfile = {
  providerId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

export type CompleteCustomerSocialSuccess = {
  ok: true;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: "CUSTOMER";
    phoneVerified: boolean;
    profileCompleted: boolean;
    authOnboardingComplete: boolean;
    needsProfileCompletion: boolean;
    needsAuthOnboarding: boolean;
  };
  token: string;
  isNewUser: boolean;
};

export type CompleteCustomerSocialFailure = {
  ok: false;
  error: string;
  code?: "EMAIL_CONFLICT" | "CREATE_FAILED" | "NO_EMAIL" | "NO_PROVIDER_ID";
};

export type CompleteCustomerSocialResult =
  | CompleteCustomerSocialSuccess
  | CompleteCustomerSocialFailure;

const EMAIL_CONFLICT_MESSAGE =
  "This email is already registered with another account. Please log in with that account.";

/**
 * Find or create a customer from a verified Google (or Facebook) social profile,
 * then issue an app JWT. Never auto-merges onto an existing email account.
 */
export async function completeCustomerSocialLogin(
  provider: OAuthProvider,
  profile: CustomerSocialProfile,
  options: { sendWelcomeEmail?: boolean } = {}
): Promise<CompleteCustomerSocialResult> {
  const email = profile.email?.trim().toLowerCase() ?? "";
  const providerId = profile.providerId?.trim() ?? "";

  if (!email) {
    return {
      ok: false,
      error: `Your ${provider} account has no email address. Use a different sign-in method.`,
      code: "NO_EMAIL",
    };
  }
  if (!providerId) {
    return {
      ok: false,
      error: `Could not read your ${provider} account id. Please try again.`,
      code: "NO_PROVIDER_ID",
    };
  }

  let isNewUser = false;

  let user = await prisma.user.findFirst({
    where: {
      oauthProvider: provider,
      oauthProviderId: providerId,
      deletedAt: null,
    },
    select: CUSTOMER_ONBOARDING_SELECT,
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        avatarUrl: profile.avatarUrl ?? undefined,
        firstName: user.firstName ?? profile.firstName ?? undefined,
        lastName: user.lastName ?? profile.lastName ?? undefined,
      },
    });
    await syncCustomerAuthOnboardingComplete(user.id);
    user = await prisma.user.findFirst({
      where: { id: user.id, deletedAt: null },
      select: CUSTOMER_ONBOARDING_SELECT,
    });
  } else {
    const emailOwner = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    });

    if (emailOwner) {
      return { ok: false, error: EMAIL_CONFLICT_MESSAGE, code: "EMAIL_CONFLICT" };
    }

    isNewUser = true;
    try {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: null,
          firstName: profile.firstName,
          lastName: profile.lastName,
          emailVerified: true,
          phoneVerified: false,
          profileCompleted: false,
          authOnboardingComplete: false,
          oauthProvider: provider,
          oauthProviderId: providerId,
          avatarUrl: profile.avatarUrl,
        },
        select: CUSTOMER_ONBOARDING_SELECT,
      });
    } catch (e: unknown) {
      const errCode =
        e && typeof e === "object" && "code" in e
          ? String((e as { code: unknown }).code)
          : "";
      if (errCode === "P2002") {
        return { ok: false, error: EMAIL_CONFLICT_MESSAGE, code: "EMAIL_CONFLICT" };
      }
      throw e;
    }
  }

  if (!user) {
    return {
      ok: false,
      error: "Could not create your account. Please try again.",
      code: "CREATE_FAILED",
    };
  }

  const sendWelcome = options.sendWelcomeEmail !== false;
  if (provider === "google" && isNewUser && sendWelcome) {
    queueGoogleOAuthWelcomeEmail({
      to: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.id,
    });
  }

  const authOnboardingComplete = await syncCustomerAuthOnboardingComplete(user.id);
  const status = customerAuthStatusFields({
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    profileCompleted: user.profileCompleted,
    authOnboardingComplete,
  });

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  return {
    ok: true,
    isNewUser,
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: "CUSTOMER",
      ...status,
    },
  };
}
