import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";
import { approveVendorStorefrontProfile } from "@/lib/data/vendor-profile";

/**
 * POST /api/admin/sellers/[sellerId]/storefront/approve — publish pending storefront
 * profile changes (display name, logo, etc.) for an approved seller.
 */
export const POST = withApiHandler(async (_request: NextRequest, context?: ApiRouteContext) => {
  const ctx = await requireAdminPermission(_request, "sellers");
  if (ctx instanceof Response) return ctx;

  const params = context ? await context.params : {};
  const sellerId = typeof params.sellerId === "string" ? params.sellerId : "";
  if (!sellerId) {
    return apiNotFound("Seller not found");
  }

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { id: true },
  });
  if (!seller) {
    return apiNotFound("Seller not found");
  }

  const result = await approveVendorStorefrontProfile(sellerId);
  if (!result.applied) {
    return apiSuccess({
      applied: false,
      message: "No pending storefront changes to approve.",
    });
  }

  return apiSuccess({ applied: true, sellerId });
});
