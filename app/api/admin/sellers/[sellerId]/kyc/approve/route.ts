import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";
import { notifyVendorApprovedSms } from "@/lib/sms/vendor-notification-sms";

/**
 * POST /api/admin/sellers/[sellerId]/kyc/approve — approve KYC for seller (admin only).
 * Sets all KYC documents to APPROVED and seller status to APPROVED.
 */
export const POST = withApiHandler(
  async (request: NextRequest, context?: ApiRouteContext) => {
    const ctx = await requireAdminPermission(request, "sellers");
    if (ctx instanceof Response) return ctx;

    const params = context ? await context.params : {};
    const sellerId = typeof params.sellerId === "string" ? params.sellerId : "";
    if (!sellerId) {
      return apiNotFound("Seller not found");
    }

    const seller = await prisma.seller.findFirst({
      where: { id: sellerId, deletedAt: null },
      select: { id: true, status: true, phone: true },
    });

    if (!seller) {
      return apiNotFound("Seller not found");
    }

    const wasAlreadyApproved = seller.status === "APPROVED";

    await prisma.$transaction([
      prisma.kYCDocument.updateMany({
        where: { sellerId },
        data: { status: "APPROVED" },
      }),
      prisma.seller.update({
        where: { id: sellerId },
        data: { status: "APPROVED" },
      }),
    ]);

    // SMS only on first approval (pending → APPROVED), not on repeat approve clicks.
    if (!wasAlreadyApproved) {
      notifyVendorApprovedSms(seller.phone);
    }

    return apiSuccess({ approved: true, sellerId });
  }
);
