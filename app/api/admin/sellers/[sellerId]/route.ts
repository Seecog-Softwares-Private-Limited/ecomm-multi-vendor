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
 * GET /api/admin/sellers/[sellerId] — full seller detail for admin (profile, stats, bank, KYC, products, orders).
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
        profileExtras: true,
        status: true,
        statusReason: true,
        createdAt: true,
        primaryCategoryId: true,
        _count: { select: { products: true, orderItems: true } },
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
        kycDocuments: {
          where: { deletedAt: null },
          select: {
            documentType: true,
            identifier: true,
            fileUrl: true,
            status: true,
          },
        },
        vendorDocuments: {
          where: { deletedAt: null },
          select: { documentName: true, documentUrl: true },
        },
      },
    });

    if (!seller) {
      return apiNotFound("Seller not found");
    }

    const [products, orderItemsWithOrder, revenueResult, avgRatingResult] =
      await Promise.all([
        prisma.product.findMany({
          where: { sellerId, deletedAt: null },
          select: {
            id: true,
            name: true,
            sellingPrice: true,
            stock: true,
            status: true,
            category: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        prisma.orderItem.findMany({
          where: { sellerId },
          select: {
            orderId: true,
            totalPrice: true,
            order: {
              select: {
                id: true,
                totalAmount: true,
                status: true,
                createdAt: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 500,
        }),
        prisma.orderItem.aggregate({
          where: { sellerId },
          _sum: { totalPrice: true },
        }),
        prisma.product.aggregate({
          where: { sellerId, deletedAt: null },
          _avg: { avgRating: true },
        }),
      ]);

    const orderMap = new Map<
      string,
      {
        id: string;
        displayId: string;
        customerName: string;
        amount: string;
        status: string;
        date: string;
      }
    >();
    for (const oi of orderItemsWithOrder) {
      const o = oi.order;
      if (!o || orderMap.has(o.id)) continue;
      const name = [o.user?.firstName, o.user?.lastName].filter(Boolean).join(" ") || "Customer";
      orderMap.set(o.id, {
        id: o.id,
        displayId: `#ORD-${o.id.slice(0, 8)}`,
        customerName: name,
        amount: String(o.totalAmount),
        status: o.status,
        date: o.createdAt.toISOString().slice(0, 10),
      });
    }
    const orders = Array.from(orderMap.values()).slice(0, 50);

    const bank = seller.bankAccounts?.[0];
    const totalRevenue = revenueResult._sum.totalPrice ?? 0;
    const avgRating = avgRatingResult._avg.avgRating ?? null;

    let gstNumber: string | undefined;
    if (seller.profileExtras) {
      try {
        const extras = JSON.parse(seller.profileExtras) as { gstin?: string };
        gstNumber = typeof extras?.gstin === "string" ? extras.gstin.trim() || undefined : undefined;
      } catch {
        // ignore
      }
    }

    const docLabels: Record<string, string> = {
      PAN: "PAN Card",
      GST_CERTIFICATE: "GST Certificate",
      ADDRESS_PROOF: "Address Proof",
    };

    return apiSuccess({
      seller: {
        id: seller.id,
        businessName: seller.businessName,
        ownerName: seller.ownerName,
        email: seller.email,
        phone: seller.phone ?? undefined,
        businessAddress: seller.businessAddress ?? undefined,
        gstNumber,
        status: seller.status,
        statusReason: seller.statusReason ?? undefined,
        createdAt: seller.createdAt.toISOString(),
      },
      stats: {
        totalProducts: seller._count.products,
        totalOrders: orderMap.size,
        totalRevenue: Number(totalRevenue),
        avgRating: avgRating != null ? Number(avgRating) : null,
      },
      bank: bank
        ? {
            bankName: bank.bankName,
            accountHolderName: bank.accountHolderName,
            accountNumber: bank.accountNumber,
            ifscCode: bank.ifscCode,
          }
        : null,
      documents: (seller.kycDocuments ?? []).map((d) => ({
        documentType: d.documentType,
        label: docLabels[d.documentType] ?? d.documentType,
        identifier: d.identifier ?? undefined,
        fileUrl: d.fileUrl ?? undefined,
        status: d.status,
      })),
      vendorDocuments: (seller.vendorDocuments ?? []).map((d) => ({
        documentName: d.documentName,
        documentUrl: d.documentUrl,
      })),
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        categoryName: p.category?.name ?? "—",
        price: Number(p.sellingPrice),
        stock: p.stock,
        status: p.status,
      })),
      orders,
    });
  }
);
