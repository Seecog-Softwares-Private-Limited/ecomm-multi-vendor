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
 * POST /api/admin/sellers/[sellerId]/kyc/approve — approve KYC for seller (admin only).
 * Sets all KYC documents to APPROVED and seller status to APPROVED.
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

    const seller = await prisma.seller.findFirst({
      where: { id: sellerId, deletedAt: null },
      select: { id: true },
    });

    if (!seller) {
      return apiNotFound("Seller not found");
    }

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

    return apiSuccess({ approved: true, sellerId });
  }
);
