import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { getSavedForLaterItems } from "@/lib/data/cart";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cart/saved — list saved-for-later items.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to view saved items.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers have saved items.");

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");

  const items = await getSavedForLaterItems(user.id);
  return apiSuccess({ items });
});
