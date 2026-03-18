import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  apiBadRequest,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

/**
 * POST /api/admin/sellers/[sellerId]/block — block, unblock, reject, or put on hold (admin only).
 * Body: { action: "block" | "unblock" | "reject" | "hold", reason?: string }.
 * Reason is required for block, reject, and hold.
 */
export const POST = withApiHandler(
  async (request: NextRequest, context?: ApiRouteContext) => {
    const ctx = await requireAdminPermission(request, "seller_management");
    if (ctx instanceof Response) return ctx;

    const params = context ? await context.params : {};
    const sellerId = typeof params.sellerId === "string" ? params.sellerId : "";
    if (!sellerId) {
      return apiNotFound("Seller not found");
    }

    let body: { action?: string; reason?: string } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const action = (body.action ?? "block").toLowerCase();
    const reason = typeof body.reason === "string" ? body.reason.trim() : undefined;

    const statusMap: Record<string, "APPROVED" | "SUSPENDED" | "REJECTED" | "ON_HOLD"> = {
      unblock: "APPROVED",
      block: "SUSPENDED",
      reject: "REJECTED",
      hold: "ON_HOLD",
    };
    const status = statusMap[action] ?? "SUSPENDED";
    const requiresReason = action === "block" || action === "reject" || action === "hold";

    if (requiresReason && (!reason || reason.length === 0)) {
      return apiBadRequest(`Reason is required when ${action}ing a vendor.`);
    }

    const seller = await prisma.seller.findFirst({
      where: { id: sellerId, deletedAt: null },
      select: { id: true },
    });

    if (!seller) {
      return apiNotFound("Seller not found");
    }

    await prisma.seller.update({
      where: { id: sellerId },
      data: {
        status,
        statusReason: action === "unblock" ? null : reason ?? null,
      },
    });

    return apiSuccess({
      sellerId,
      status,
      blocked: status === "SUSPENDED",
    });
  }
);
