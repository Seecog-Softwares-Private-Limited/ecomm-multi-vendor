import { NextRequest, NextResponse } from "next/server";
import {
  getOAuthAppBaseUrl,
  resolveOAuthBaseUrlFromRequest,
  verifyVendorNativeHandoff,
} from "@/lib/auth/oauth";
import { signToken, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    select: { id: true, email: true },
  });
  if (!user) {
    return loginRedirect("Account not found. Please try again.");
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  const dest = new URL(returnUrl, appBase);
  const response = NextResponse.redirect(dest.toString());
  setAuthCookie(response, token);
  return response;
}
