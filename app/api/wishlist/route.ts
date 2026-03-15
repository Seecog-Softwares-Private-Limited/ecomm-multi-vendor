import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { getWishlistItems, addWishlistItem, clearWishlist } from "@/lib/data/wishlist";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/wishlist — list current user's wishlist with product details.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to view your wishlist.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers have a wishlist.");

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");

  const items = await getWishlistItems(user.id);
  const list = items.map((i) => ({
    id: i.id,
    productId: i.productId,
    variantKey: i.variantKey,
    product: {
      id: i.product.id,
      name: i.product.name,
      sellingPrice: i.product.sellingPrice,
      mrp: i.product.mrp,
      stock: i.product.stock,
      status: i.product.status,
      avgRating: i.product.avgRating,
      imageUrl: i.product.imageUrl,
    },
  }));

  return apiSuccess({ items: list });
});

/**
 * POST /api/wishlist — add a product to wishlist.
 * Body: { productId: string, variantKey?: string | null }
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to add to wishlist.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can add to wishlist.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) return apiBadRequest("Body must be an object.");

  const { productId, variantKey } = body as { productId?: unknown; variantKey?: unknown };
  if (typeof productId !== "string" || !productId.trim()) {
    return apiBadRequest("productId is required.");
  }

  const product = await prisma.product.findFirst({
    where: { id: productId.trim(), deletedAt: null },
    select: { id: true },
  });
  if (!product) return apiBadRequest("Product not found.");

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");

  const vk =
    variantKey === null || variantKey === undefined
      ? null
      : typeof variantKey === "string"
        ? variantKey.trim() || null
        : null;

  const result = await addWishlistItem(user.id, productId.trim(), vk);
  return apiSuccess({ id: result.id, message: "Added to wishlist" });
});

/**
 * DELETE /api/wishlist — clear entire wishlist (no body).
 */
export const DELETE = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to manage wishlist.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers have a wishlist.");

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");

  const count = await clearWishlist(user.id);
  return apiSuccess({ message: "Wishlist cleared", removedCount: count });
});
