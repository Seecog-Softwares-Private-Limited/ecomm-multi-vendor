import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import {
  createCheckoutSession,
  type CreateCheckoutSessionInput,
} from "@/lib/commerce/checkout-session.service";

/**
 * POST /api/checkout/sessions — create a checkout session (CART | BUY_NOW | REORDER).
 * Body:
 *   { type: "CART", cartItemIds: string[] }
 *   { type: "BUY_NOW", lines: [{ productId, variantKey?, quantity? }] }
 *   { type: "REORDER", lines: [{ productId, variantKey?, quantity? }] }
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to checkout.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can checkout.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) return apiBadRequest("Body must be an object");

  const { type, cartItemIds, lines } = body as {
    type?: unknown;
    cartItemIds?: unknown;
    lines?: unknown;
  };

  if (type !== "CART" && type !== "BUY_NOW" && type !== "REORDER") {
    return apiBadRequest('type must be "CART", "BUY_NOW", or "REORDER".');
  }

  let input: CreateCheckoutSessionInput;
  if (type === "CART") {
    if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      return apiBadRequest("cartItemIds must be a non-empty array for CART checkout.");
    }
    const ids = cartItemIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0);
    if (ids.length === 0) return apiBadRequest("cartItemIds must contain valid IDs.");
    input = { type: "CART", cartItemIds: ids };
  } else {
    if (!Array.isArray(lines) || lines.length === 0) {
      return apiBadRequest("lines must be a non-empty array.");
    }
    const parsedLines = lines
      .filter((l): l is Record<string, unknown> => typeof l === "object" && l !== null)
      .map((l) => ({
        productId: typeof l.productId === "string" ? l.productId.trim() : "",
        variantKey:
          l.variantKey === null || l.variantKey === undefined
            ? null
            : typeof l.variantKey === "string"
              ? l.variantKey.trim() || null
              : null,
        quantity: typeof l.quantity === "number" ? l.quantity : 1,
      }))
      .filter((l) => l.productId.length > 0);

    if (parsedLines.length === 0) {
      return apiBadRequest("Each line must include a valid productId.");
    }
    input = { type, lines: parsedLines };
  }

  const result = await createCheckoutSession(session.sub, input);
  return apiSuccess({
    sessionId: result.sessionId,
    expiresAt: result.expiresAt,
    cartVersion: result.cartVersion,
    message: "Checkout session created",
  });
});
