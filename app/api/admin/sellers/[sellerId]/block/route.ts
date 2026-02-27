import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiNotFound,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ sellerId: string }> };

/**
 * POST /api/admin/sellers/[sellerId]/block — block (suspend) or unblock seller (admin only).
 * Body: { action: "block" | "unblock" }. Block sets status to SUSPENDED, unblock to APPROVED.
 */
export const POST = withApiHandler(
  async (request: NextRequest, context?: RouteContext) => {
    const session = await requireSession(request);
    if (session.role !== "ADMIN") {
      return apiForbidden("Admin access required");
    }

    const params = context?.params;
    const sellerId = params ? (await params).sellerId : undefined;
    if (!sellerId) {
      return apiNotFound("Seller not found");
    }

    let body: { action?: string } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const action = (body.action ?? "block").toLowerCase();
    const status = action === "unblock" ? "APPROVED" : "SUSPENDED";

    const seller = await prisma.seller.findFirst({
      where: { id: sellerId, deletedAt: null },
      select: { id: true },
    });

    if (!seller) {
      return apiNotFound("Seller not found");
    }

    await prisma.seller.update({
      where: { id: sellerId },
      data: { status },
    });

    return apiSuccess({
      sellerId,
      status,
      blocked: status === "SUSPENDED",
    });
  }
);
