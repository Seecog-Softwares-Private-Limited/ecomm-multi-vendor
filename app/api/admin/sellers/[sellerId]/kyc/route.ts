import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/sellers/[sellerId]/kyc — seller info + KYC documents (admin only).
 */
export const GET = withApiHandler(
  async (request: NextRequest, context?: ApiRouteContext) => {
    const session = await requireSession(request);
    if (session.role !== "ADMIN") {
      return apiForbidden("Admin access required");
    }

    const params = context ? await context.params : {};
    const sellerId = typeof params.sellerId === "string" ? params.sellerId : "";
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
        profileExtras: true,
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
        bankAccounts: {
          where: { deletedAt: null },
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            bankName: true,
            accountHolderName: true,
            accountNumber: true,
            ifscCode: true,
          },
        },
      },
    });

    if (!seller) {
      return apiNotFound("Seller not found");
    }

    let gstNumber: string | undefined;
    if (seller.profileExtras) {
      try {
        const extras = JSON.parse(seller.profileExtras) as { gstin?: string };
        gstNumber = typeof extras?.gstin === "string" ? extras.gstin.trim() || undefined : undefined;
      } catch {
        // ignore
      }
    }

    const bank = seller.bankAccounts?.[0];

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
        gstNumber,
      },
      bank: bank
        ? {
            bankName: bank.bankName,
            accountHolderName: bank.accountHolderName,
            accountNumber: bank.accountNumber,
            ifscCode: bank.ifscCode,
          }
        : null,
      documents,
    });
  }
);
