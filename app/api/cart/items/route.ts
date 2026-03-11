import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { addToCart, getCartItems } from "@/lib/data/cart";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cart/items — list current user's cart items with product details.
 * Requires customer session.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) {
    return apiUnauthorized("Please log in to view your cart.");
  }
  if (session.role !== "CUSTOMER") {
    return apiForbidden("Only customers have a cart.");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");
  const items = await getCartItems(user.id);
  return apiSuccess({ items });
});

/**
 * POST /api/cart/items — add a product to the current user's cart.
 * Body: { productId: string, quantity?: number, variantKey?: string | null }
 * Requires customer session.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) {
    return apiUnauthorized("Please log in to add items to your cart.");
  }
  if (session.role !== "CUSTOMER") {
    return apiForbidden("Only customers can add items to the cart.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  if (typeof body !== "object" || body === null) {
    return apiBadRequest("Body must be an object");
  }

  const { productId, quantity = 1, variantKey = null } = body as {
    productId?: unknown;
    quantity?: unknown;
    variantKey?: unknown;
  };

  if (typeof productId !== "string" || !productId.trim()) {
    return apiBadRequest("productId is required and must be a non-empty string");
  }

  const qty = typeof quantity === "number" ? Math.round(quantity) : 1;
  const vk =
    variantKey === null || variantKey === undefined
      ? null
      : typeof variantKey === "string"
        ? variantKey.trim() || null
        : null;

  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null, status: "ACTIVE" },
    select: { id: true },
  });
  if (!product) {
    return apiBadRequest("Product not found or not available");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) {
    return apiUnauthorized("User not found.");
  }

  const result = await addToCart(user.id, productId, qty, vk);
  return apiSuccess({
    cartItemId: result.id,
    quantity: result.quantity,
    message: "Added to cart",
  });
});
