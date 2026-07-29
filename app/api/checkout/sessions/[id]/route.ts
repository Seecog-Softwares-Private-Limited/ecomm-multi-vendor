import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  type ApiRouteContext,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import {
  confirmCheckoutSessionPrices,
  getCheckoutSessionForUser,
} from "@/lib/commerce/checkout-session.service";
import { cancelCheckoutSession } from "@/lib/commerce/order-placement.service";

/**
 * GET /api/checkout/sessions/:id — checkout preview (items, totals, price changes).
 * Query: couponCode (optional)
 */
export const GET = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to view checkout.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can checkout.");

  const params = context ? await context.params : {};
  const id = typeof params.id === "string" ? params.id.trim() : "";
  if (!id) return apiBadRequest("Session id is required.");

  const couponCode = request.nextUrl.searchParams.get("couponCode");
  const payload = await getCheckoutSessionForUser(id, session.sub, couponCode);

  return apiSuccess(payload);
});

/**
 * PATCH /api/checkout/sessions/:id — confirm price changes after seller price update.
 * Body: { action: "confirm_prices" }
 */
export const PATCH = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can update checkout.");

  const params = context ? await context.params : {};
  const id = typeof params.id === "string" ? params.id.trim() : "";
  if (!id) return apiBadRequest("Session id is required.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  const action =
    typeof body === "object" && body !== null && "action" in body
      ? String((body as { action: unknown }).action)
      : "";

  if (action === "confirm_prices") {
    await confirmCheckoutSessionPrices(id, session.sub);
    const payload = await getCheckoutSessionForUser(id, session.sub);
    return apiSuccess(payload);
  }

  if (action === "cancel") {
    await cancelCheckoutSession(id, session.sub);
    return apiSuccess({ cancelled: true, message: "Checkout cancelled." });
  }

  return apiBadRequest(
    'Unsupported action. Use { "action": "confirm_prices" } or { "action": "cancel" }.'
  );
});
