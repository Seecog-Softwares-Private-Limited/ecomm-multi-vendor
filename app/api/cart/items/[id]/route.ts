import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { updateCartItemQuantity, removeCartItem, setCartItemSavedForLater } from "@/lib/data/cart";
import { prisma } from "@/lib/prisma";

function segmentParam(raw: string | string[] | undefined): string | undefined {
  if (typeof raw === "string") return raw.trim() || undefined;
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "string") {
    return raw[0].trim() || undefined;
  }
  return undefined;
}

/**
 * PATCH /api/cart/items/[id] — update cart item quantity.
 * Body: { quantity: number }
 * Requires customer session.
 */
export const PATCH = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to update your cart.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can update the cart.");

  const params = context ? await context.params : {};
  const id = segmentParam(params.id);
  if (!id?.trim()) return apiBadRequest("Cart item id is required.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const action =
    typeof body === "object" && body !== null && "action" in body
      ? String((body as { action: unknown }).action)
      : null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");

  if (action === "save_for_later" || action === "move_to_cart") {
    const ok = await setCartItemSavedForLater(user.id, id, action === "save_for_later");
    if (!ok) return apiNotFound("Cart item not found.");
    return apiSuccess({
      savedForLater: action === "save_for_later",
      message: action === "save_for_later" ? "Saved for later" : "Moved to cart",
    });
  }

  const quantity =
    typeof body === "object" && body !== null && "quantity" in body
      ? Number((body as { quantity: unknown }).quantity)
      : NaN;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return apiBadRequest("quantity must be an integer between 1 and 99");
  }

  const result = await updateCartItemQuantity(user.id, id, quantity);
  if (!result.ok) {
    if (result.reason === "not_found") return apiNotFound("Cart item not found.");
    return apiBadRequest(
      result.available === 0
        ? "This item is out of stock."
        : `Only ${result.available} left in stock.`
    );
  }
  return apiSuccess({ quantity: result.quantity });
});

/**
 * DELETE /api/cart/items/[id] — remove item from cart.
 * Requires customer session.
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to update your cart.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can update the cart.");

  const params = context ? await context.params : {};
  const id = segmentParam(params.id);
  if (!id?.trim()) return apiBadRequest("Cart item id is required.");

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");

  const removed = await removeCartItem(user.id, id);
  if (!removed) return apiNotFound("Cart item not found.");
  return apiSuccess({ removed: true });
});
