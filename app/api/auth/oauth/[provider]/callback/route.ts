import { NextRequest, NextResponse } from "next/server";
import type { ApiRouteContext } from "@/lib/api";
import {
  exchangeOAuthCode,
  decodeOAuthState,
  OAUTH_STATE_COOKIE,
  getOAuthAppBaseUrl,
  resolveOAuthBaseUrlFromRequest,
  validateOAuthCallbackState,
  oauthStateErrorMessage,
  type OAuthProvider,
} from "@/lib/auth/oauth";
import { signToken, setAuthCookie } from "@/lib/auth";
import { queueGoogleOAuthWelcomeEmail } from "@/lib/email/oauth-google-welcome";
import { prisma } from "@/lib/prisma";
import {
  CUSTOMER_ONBOARDING_SELECT,
  syncCustomerAuthOnboardingComplete,
} from "@/lib/auth/customer-onboarding";
import {
  completeVendorGoogleOAuth,
  vendorErrorRedirect,
} from "@/lib/auth/complete-vendor-google-oauth";

const SUPPORTED_PROVIDERS: OAuthProvider[] = ["google", "facebook"];

function errorRedirect(baseUrl: string, message: string): NextResponse {
  const url = new URL("/login", baseUrl);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url.toString());
}

/**
 * GET /api/auth/oauth/[provider]/callback
 *
 * Shared Google redirect URI for customer + vendor (registered in Google Cloud).
 * Vendor sessions are selected when OAuth state has `flow: "vendor"`.
 *
 * Customer identity resolution (Phase 2):
 * 1. Lookup by (oauthProvider, oauthProviderId) first
 * 2. If found → login that User (never rewrite identity onto another account)
 * 3. If not found and email belongs to another User → conflict (no auto-merge)
 * 4. Else create incomplete User (passwordHash=null, phoneVerified=false)
 */
export async function GET(request: NextRequest, context: ApiRouteContext) {
  const params = await context.params;
  const provider = (Array.isArray(params.provider) ? params.provider[0] : params.provider) as
    | OAuthProvider
    | undefined;

  const requestBase = resolveOAuthBaseUrlFromRequest(request);
  const appBase = requestBase || getOAuthAppBaseUrl();

  if (!provider || !SUPPORTED_PROVIDERS.includes(provider)) {
    return errorRedirect(appBase, "Unsupported login provider");
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateFromQuery = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const stateObjEarly = stateFromQuery ? decodeOAuthState(stateFromQuery) : null;
  const isVendorFlow = stateObjEarly?.flow === "vendor";

  if (oauthError) {
    if (isVendorFlow) {
      return vendorErrorRedirect(
        appBase,
        oauthError === "access_denied" ? "Login was cancelled" : "OAuth error",
        stateObjEarly?.returnUrl
      );
    }
    return errorRedirect(
      appBase,
      oauthError === "access_denied" ? "Login was cancelled" : "OAuth error"
    );
  }

  if (!code) {
    if (isVendorFlow) {
      return vendorErrorRedirect(
        appBase,
        "Missing authorization code",
        stateObjEarly?.returnUrl
      );
    }
    return errorRedirect(appBase, "Missing authorization code");
  }

  const stateValidation = validateOAuthCallbackState(request, stateFromQuery);
  if (!stateValidation.ok) {
    const message = oauthStateErrorMessage(stateValidation.reason);
    if (isVendorFlow) {
      return vendorErrorRedirect(appBase, message, stateObjEarly?.returnUrl);
    }
    return errorRedirect(appBase, message);
  }

  const stateObj = stateValidation.state;

  if (stateObj.flow === "vendor") {
    return completeVendorGoogleOAuth({
      provider,
      code,
      requestBase,
      appBase,
      returnUrl: stateObj.returnUrl || "/vendor",
      native: stateObj.native === true,
    });
  }

  const returnUrl = stateObj.returnUrl || "/";

  let oauthUser;
  try {
    oauthUser = await exchangeOAuthCode(provider, code, requestBase);
  } catch (e) {
    console.error(`[OAuth] ${provider} code exchange failed:`, e);
    return errorRedirect(appBase, "Failed to authenticate with " + provider);
  }

  if (!oauthUser.email) {
    return errorRedirect(
      appBase,
      "Your " + provider + " account has no email address. Use a different sign-in method."
    );
  }

  if (!oauthUser.providerId) {
    return errorRedirect(appBase, "Could not read your " + provider + " account id. Please try again.");
  }

  let isNewUser = false;

  // 1) Primary resolution: stable provider ID
  let user = await prisma.user.findFirst({
    where: {
      oauthProvider: provider,
      oauthProviderId: oauthUser.providerId,
      deletedAt: null,
    },
    select: CUSTOMER_ONBOARDING_SELECT,
  });

  if (user) {
    // Returning social user — refresh profile fields without touching other identities.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        avatarUrl: oauthUser.avatarUrl ?? undefined,
        firstName: user.firstName ?? oauthUser.firstName ?? undefined,
        lastName: user.lastName ?? oauthUser.lastName ?? undefined,
      },
    });
    await syncCustomerAuthOnboardingComplete(user.id);
    user = await prisma.user.findFirst({
      where: { id: user.id, deletedAt: null },
      select: CUSTOMER_ONBOARDING_SELECT,
    });
  } else {
    // 2) No provider link — never auto-merge onto an existing email account.
    const emailOwner = await prisma.user.findFirst({
      where: { email: oauthUser.email, deletedAt: null },
      select: {
        id: true,
        oauthProvider: true,
        oauthProviderId: true,
      },
    });

    if (emailOwner) {
      return errorRedirect(
        appBase,
        "This email is already registered with another account. Please log in with that account."
      );
    }

    // 3) Create incomplete Google/Facebook-first customer (no password; phone OTP still required).
    isNewUser = true;
    try {
      user = await prisma.user.create({
        data: {
          email: oauthUser.email,
          passwordHash: null,
          firstName: oauthUser.firstName,
          lastName: oauthUser.lastName,
          emailVerified: true,
          phoneVerified: false,
          profileCompleted: false,
          authOnboardingComplete: false,
          oauthProvider: provider,
          oauthProviderId: oauthUser.providerId,
          avatarUrl: oauthUser.avatarUrl,
        },
        select: CUSTOMER_ONBOARDING_SELECT,
      });
    } catch (e: unknown) {
      const errCode =
        e && typeof e === "object" && "code" in e
          ? String((e as { code: unknown }).code)
          : "";
      if (errCode === "P2002") {
        return errorRedirect(
          appBase,
          "This email is already registered with another account. Please log in with that account."
        );
      }
      throw e;
    }
  }

  if (!user) {
    return errorRedirect(appBase, "Could not create your account. Please try again.");
  }

  if (provider === "google" && isNewUser) {
    queueGoogleOAuthWelcomeEmail({
      to: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.id,
    });
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  // Incomplete until phone OTP (and any other onboarding fields) are satisfied.
  const destination =
    !user.authOnboardingComplete || !user.phoneVerified
      ? "/complete-profile"
      : returnUrl;

  const response = NextResponse.redirect(new URL(destination, appBase).toString());
  setAuthCookie(response, token);
  response.cookies.set(OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });

  return response;
}
