import { NextRequest, NextResponse } from "next/server";
import {
  getOAuthAppBaseUrl,
  resolveOAuthBaseUrlFromRequest,
  verifyVendorNativeHandoff,
} from "@/lib/auth/oauth";
import { signToken, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { htmlRedirectWithCookie } from "@/lib/auth/html-redirect-with-cookie";

/**
 * GET /api/auth/vendor-oauth/native-complete?token=<handoff>&returnUrl=/vendor
 *
 * Redeems the one-time hand-off token minted after Google OAuth completed inside
 * the native ASWebAuthenticationSession / Chrome Custom Tab. This route is loaded
 * by the app WebView, so `setAuthCookie` lands the vendor session cookie in the
 * WebView's own cookie store (which the auth-session browser could not do).
 */
export async function GET(request: NextRequest) {
  const requestBase = resolveOAuthBaseUrlFromRequest(request);
  const appBase = requestBase || getOAuthAppBaseUrl();

  const { searchParams } = new URL(request.url);
  const rawToken = searchParams.get("token");
  const returnUrl = searchParams.get("returnUrl") || "/vendor";

  const loginRedirect = (message: string): NextResponse => {
    const url = new URL("/vendor/login", appBase);
    url.searchParams.set("error", message);
    url.searchParams.set("app", "1");
    return NextResponse.redirect(url.toString());
  };

  if (!rawToken) {
    return loginRedirect("Google sign-in did not complete. Please try again.");
  }

  const handoff = verifyVendorNativeHandoff(rawToken);
  if (!handoff) {
    return loginRedirect("Google sign-in link expired. Please try again.");
  }

  const seller = await prisma.seller.findFirst({
    where: { id: handoff.sub, email: handoff.email, deletedAt: null },
    select: { id: true, email: true, authOnboardingComplete: true },
  });
  if (!seller) {
    return loginRedirect("Vendor account not found. Please try again.");
  }

  const token = await signToken({
    sub: seller.id,
    email: seller.email,
    role: "SELLER",
  });

  let destinationPath = returnUrl;
  if (!seller.authOnboardingComplete) {
    destinationPath = "/vendor/complete-account";
  }
  const dest = new URL(destinationPath, appBase);
  if (!dest.searchParams.has("app")) dest.searchParams.set("app", "1");

  const response = htmlRedirectWithCookie(dest.toString());
  setAuthCookie(response, token);
  return response;
}
