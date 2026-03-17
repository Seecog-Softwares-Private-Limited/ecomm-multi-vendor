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
import { updateCartItemQuantity, removeCartItem } from "@/lib/data/cart";
import { prisma } from "@/lib/prisma";

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
  const id = typeof params.id === "string" ? params.id : undefined;
  if (!id?.trim()) return apiBadRequest("Cart item id is required.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  const quantity =
    typeof body === "object" && body !== null && "quantity" in body
      ? Number((body as { quantity: unknown }).quantity)
      : NaN;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return apiBadRequest("quantity must be an integer between 1 and 99");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");

  const newQty = await updateCartItemQuantity(user.id, id, quantity);
  if (newQty === null) return apiNotFound("Cart item not found.");
  return apiSuccess({ quantity: newQty });
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
  const id = typeof params.id === "string" ? params.id : undefined;
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
