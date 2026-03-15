import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiNotFound, apiUnauthorized, apiForbidden } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { removeWishlistItem } from "@/lib/data/wishlist";
import { prisma } from "@/lib/prisma";

type RouteContext = { params?: Promise<Record<string, string | string[]>> };

/**
 * DELETE /api/wishlist/[id] — remove one item from wishlist.
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to manage wishlist.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers have a wishlist.");

  const params = context?.params ? await context.params : {};
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  if (!id?.trim()) return apiNotFound("Wishlist item not found.");

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");

  const removed = await removeWishlistItem(user.id, id.trim());
  if (!removed) return apiNotFound("Wishlist item not found.");
  return apiSuccess({ message: "Removed from wishlist" });
});
