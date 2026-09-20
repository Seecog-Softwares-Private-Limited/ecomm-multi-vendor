import { NextResponse } from "next/server";
import {
  exchangeOAuthCode,
  OAUTH_STATE_COOKIE,
  VENDOR_OAUTH_STATE_COOKIE,
  signVendorNativeHandoff,
  type OAuthProvider,
  type OAuthUserInfo,
} from "@/lib/auth/oauth";
import { signToken, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyVendorGoogleLogin } from "@/lib/auth/resolve-vendor-google-login";
import { linkGoogleToVendorSeller, VendorGoogleLinkError } from "@/lib/auth/link-vendor-google";
import { syncSellerAuthOnboardingComplete } from "@/lib/auth/seller-onboarding";

const NATIVE_OAUTH_CALLBACK = "vendorapp://google-auth";
const VENDOR_AUTH_ONBOARDING_PATH = "/vendor/complete-account";

function vendorErrorRedirect(
  baseUrl: string,
  message: string,
  returnUrl?: string
): NextResponse {
  const url = new URL("/vendor/login", baseUrl);
  url.searchParams.set("error", message);
  if (returnUrl) {
    url.searchParams.set("callbackUrl", returnUrl);
    try {
      const ret = new URL(returnUrl, baseUrl);
      const app = ret.searchParams.get("app");
      const v = ret.searchParams.get("v");
      if (app) url.searchParams.set("app", app);
      if (v) url.searchParams.set("v", v);
    } catch {
      /* ignore */
    }
  }
  return NextResponse.redirect(url.toString());
}

function clearOAuthStateCookies(response: NextResponse): void {
  response.cookies.set(OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(VENDOR_OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });
}

/**
 * Completes vendor Google OAuth after Google redirects.
 * Identity key is Google `sub` (`oauthProviderId`). A verified Google email may
 * attach that `sub` to an existing Seller whose email is already verified —
 * never by trusting a frontend email or sellerId, and never by querying User.
 */
export async function completeVendorGoogleOAuth(opts: {
  provider: OAuthProvider;
  code: string;
  requestBase: string;
  appBase: string;
  returnUrl: string;
  native?: boolean;
  oauthUser?: OAuthUserInfo;
  /** When set, link Google to this authenticated Seller instead of login/create. */
  linkSellerId?: string;
}): Promise<NextResponse> {
  const { provider, code, requestBase, appBase, returnUrl, native, linkSellerId } = opts;

  const fail = (message: string): NextResponse => {
    if (native) {
      const url = new URL(NATIVE_OAUTH_CALLBACK);
      url.searchParams.set("error", message);
      return NextResponse.redirect(url.toString());
    }
    if (linkSellerId) {
      const url = new URL(returnUrl || "/vendor/settings", appBase);
      url.searchParams.set("googleLinkError", message);
      return NextResponse.redirect(url.toString());
    }
    return vendorErrorRedirect(appBase, message, returnUrl);
  };

  let oauthUser = opts.oauthUser;
  if (!oauthUser) {
    try {
      oauthUser = await exchangeOAuthCode(provider, code, requestBase, "customer");
    } catch (e) {
      console.error(`[Vendor OAuth] ${provider} code exchange failed:`, e);
      return fail("Failed to authenticate with Google");
    }
  }

  if (!oauthUser.providerId?.trim()) {
    return fail("Google identity is missing. Please try again.");
  }

  const providerId = oauthUser.providerId.trim();

  // Authenticated "Connect Google" flow — attach sub to current Seller only.
  if (linkSellerId?.trim()) {
    // #region agent log
    fetch('http://127.0.0.1:7456/ingest/072b8280-cbe0-406c-9e62-41143fb8780b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'337f7e'},body:JSON.stringify({sessionId:'337f7e',runId:'pre-fix',hypothesisId:'D',location:'complete-vendor-google-oauth.ts:link-branch',message:'Entered authenticated linkSellerId branch (not login resolver)',data:{hasLinkSellerId:true},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    try {
      await linkGoogleToVendorSeller(linkSellerId.trim(), providerId);
    } catch (err) {
      if (err instanceof VendorGoogleLinkError) {
        return fail(err.message);
      }
      console.error("[Vendor OAuth] link Google failed:", err);
      return fail("Could not connect Google. Please try again.");
    }
    const dest = new URL(returnUrl || "/vendor/settings", appBase);
    dest.searchParams.set("googleLinked", "1");
    const response = NextResponse.redirect(dest.toString());
    clearOAuthStateCookies(response);
    return response;
  }

  if (!oauthUser.email) {
    return fail(
      "Your Google account has no email address. Use email and password instead."
    );
  }

  const email = oauthUser.email.trim().toLowerCase();
  // #region agent log
  fetch('http://127.0.0.1:7456/ingest/072b8280-cbe0-406c-9e62-41143fb8780b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'337f7e'},body:JSON.stringify({sessionId:'337f7e',runId:'pre-fix',hypothesisId:'B',location:'complete-vendor-google-oauth.ts:pre-apply',message:'Vendor Google login inputs before applyVendorGoogleLogin',data:{emailDomain:email.split('@')[1]??null,emailLen:email.length,googleEmailVerified:oauthUser.emailVerified===true,hasProviderId:Boolean(providerId),linkSellerIdPresent:Boolean(linkSellerId),native:Boolean(native)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  const applied = await applyVendorGoogleLogin({
    googleSub: providerId,
    email,
    googleEmailVerified: oauthUser.emailVerified === true,
    name: `${oauthUser.firstName ?? ""} ${oauthUser.lastName ?? ""}`.trim(),
  });

  // #region agent log
  fetch('http://127.0.0.1:7456/ingest/072b8280-cbe0-406c-9e62-41143fb8780b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'337f7e'},body:JSON.stringify({sessionId:'337f7e',runId:'pre-fix',hypothesisId:'C',location:'complete-vendor-google-oauth.ts:post-apply',message:'applyVendorGoogleLogin result',data:{ok:applied.ok,code:applied.ok?null:applied.code,failMessagePrefix:applied.ok?null:String(applied.message).slice(0,80),isNew:applied.ok?applied.isNew:null,sellerIdPrefix:applied.ok?String(applied.seller.id).slice(0,8):null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (!applied.ok) {
    return fail(applied.message);
  }

  const seller = applied.seller;

  try {
    await prisma.seller.update({
      where: { id: seller.id },
      data: {
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });
  } catch (e) {
    console.error("[Vendor OAuth] could not clear verification token (non-fatal):", e);
  }

  const authComplete = await syncSellerAuthOnboardingComplete(seller.id);

  if (native) {
    const handoff = signVendorNativeHandoff({ sub: seller.id, email: seller.email });
    const url = new URL(NATIVE_OAUTH_CALLBACK);
    url.searchParams.set("token", handoff);
    url.searchParams.set(
      "returnUrl",
      authComplete ? returnUrl || "/vendor" : VENDOR_AUTH_ONBOARDING_PATH
    );
    const response = NextResponse.redirect(url.toString());
    clearOAuthStateCookies(response);
    return response;
  }

  const token = await signToken({
    sub: seller.id,
    email: seller.email,
    role: "SELLER",
  });

  const destPath = authComplete
    ? returnUrl || "/vendor"
    : `${VENDOR_AUTH_ONBOARDING_PATH}?callbackUrl=${encodeURIComponent(returnUrl || "/vendor")}`;
  const dest = new URL(destPath, appBase);
  if (!dest.searchParams.has("app") && returnUrl.includes("app=")) {
    try {
      const fromReturn = new URL(returnUrl, appBase);
      const app = fromReturn.searchParams.get("app");
      if (app) dest.searchParams.set("app", app);
      const v = fromReturn.searchParams.get("v");
      if (v) dest.searchParams.set("v", v);
    } catch {
      /* ignore */
    }
  }

  const response = NextResponse.redirect(dest.toString());
  setAuthCookie(response, token);
  clearOAuthStateCookies(response);
  return response;
}

export { vendorErrorRedirect };
