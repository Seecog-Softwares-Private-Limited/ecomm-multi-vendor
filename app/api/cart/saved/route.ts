import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
} from "@/lib/api";
import { assertCustomerAuthComplete } from "@/lib/auth";
import { getSavedForLaterItems } from "@/lib/data/cart";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cart/saved — list saved-for-later items.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await assertCustomerAuthComplete(request, {
    unauthorizedMessage: "Please log in to view saved items.",
    forbiddenMessage: "Only customers have saved items.",
  });

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");

  const items = await getSavedForLaterItems(user.id);
  return apiSuccess({ items });
});
