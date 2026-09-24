import { NextResponse } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api";
import { setCustomerAppCookie } from "@/lib/auth/customer-app-cookie";

/**
 * POST /api/auth/customer-app/marker
 *
 * Called from the storefront when `isCustomerNativeApp()` is true (Flutter
 * WebView). Sets an HttpOnly environment cookie so API routes can detect
 * Customer App without reading window globals.
 *
 * Not authentication — does not grant privileges by itself.
 */
export const POST = withApiHandler(async () => {
  const response = apiSuccess({ ok: true });
  setCustomerAppCookie(response);
  return response;
});

/** Reject non-POST for clarity. */
export const GET = withApiHandler(async () => {
  return NextResponse.json(
    { error: { message: "Method not allowed", code: "METHOD_NOT_ALLOWED" } },
    { status: 405 }
  );
});
