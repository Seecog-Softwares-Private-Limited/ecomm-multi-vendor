import { NextRequest, NextResponse } from "next/server";
import {
  getOAuthAppBaseUrl,
  resolveOAuthBaseUrlFromRequest,
  verifyVendorNativeHandoff,
} from "@/lib/auth/oauth";
import { signToken, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { htmlRedirectWithCookie } from "@/lib/auth/html-redirect-with-cookie";
import { setCustomerAppCookie } from "@/lib/auth/customer-app-cookie";
import { computeCustomerAppAuthReady } from "@/lib/auth/customer-onboarding";

/**
 * GET /api/auth/oauth/native-complete?token=<handoff>&returnUrl=/
 *
 * Redeems the one-time hand-off token minted after Google OAuth completed inside
 * Chrome Custom Tabs / ASWebAuthenticationSession (Customer Flutter app).
 * Loaded by the WebView so `setAuthCookie` lands in the WebView cookie jar.
 */
export async function GET(request: NextRequest) {
  const requestBase = resolveOAuthBaseUrlFromRequest(request);
  const appBase = requestBase || getOAuthAppBaseUrl();

  const { searchParams } = new URL(request.url);
  const rawToken = searchParams.get("token");
  const returnUrl = searchParams.get("returnUrl") || "/";

  const loginRedirect = (message: string): NextResponse => {
    const url = new URL("/login", appBase);
    url.searchParams.set("error", message);
    return NextResponse.redirect(url.toString());
  };

  if (!rawToken) {
    return loginRedirect("Google sign-in did not complete. Please try again.");
  }

  const handoff = verifyVendorNativeHandoff(rawToken);
  if (!handoff) {
    return loginRedirect("Google sign-in link expired. Please try again.");
  }

  const user = await prisma.user.findFirst({
    where: { id: handoff.sub, email: handoff.email, deletedAt: null },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      emailVerified: true,
      authOnboardingComplete: true,
      phoneVerified: true,
    },
  });
  if (!user) {
    return loginRedirect("Account not found. Please try again.");
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  // Prefer onboarding when incomplete — avoids / → middleware → /login races
  // when the session cookie is still settling in the WebView.
  // Customer App: phone optional until order (soft-ready users skip /complete-profile).
  const appReady = computeCustomerAppAuthReady(user);
  const destinationPath =
    user.authOnboardingComplete || appReady ? returnUrl : "/complete-profile";
  const dest = new URL(destinationPath, appBase);
  const response = htmlRedirectWithCookie(dest.toString());
  setAuthCookie(response, token);
  // This route is loaded only by the Customer Flutter WebView after OAuth.
  setCustomerAppCookie(response);
  return response;
}
