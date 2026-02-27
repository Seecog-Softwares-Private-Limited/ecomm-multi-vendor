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
 * GET /api/admin/sellers/[sellerId]/kyc — seller info + KYC documents (admin only).
 */
export const GET = withApiHandler(
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
      select: {
        id: true,
        businessName: true,
        ownerName: true,
        email: true,
        phone: true,
        businessAddress: true,
        status: true,
        kycDocuments: {
          where: { deletedAt: null },
          select: {
            id: true,
            documentType: true,
            identifier: true,
            fileUrl: true,
            status: true,
          },
        },
      },
    });

    if (!seller) {
      return apiNotFound("Seller not found");
    }

    const documents = (seller.kycDocuments ?? []).map((d) => ({
      id: d.id,
      documentType: d.documentType,
      identifier: d.identifier ?? undefined,
      fileUrl: d.fileUrl ?? undefined,
      status: d.status,
    }));

    return apiSuccess({
      seller: {
        id: seller.id,
        businessName: seller.businessName,
        ownerName: seller.ownerName,
        email: seller.email,
        phone: seller.phone ?? undefined,
        businessAddress: seller.businessAddress ?? undefined,
        status: seller.status,
      },
      documents,
    });
  }
);
