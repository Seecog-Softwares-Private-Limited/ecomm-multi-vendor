import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

function resolveRequestOrigin(request: NextRequest): string {
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    (process.env.PORT ? `localhost:${process.env.PORT}` : "localhost:3000");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto === "https" ? "https" : "http"}://${host}`;
}

function normalizeUploadUrl(rawUrl: string | null | undefined, request: NextRequest): string | undefined {
  if (!rawUrl) return undefined;
  const origin = resolveRequestOrigin(request);

  // Relative paths are always served from current app host.
  if (rawUrl.startsWith("/")) {
    return `${origin}${rawUrl}`;
  }

  try {
    const parsed = new URL(rawUrl);
    const isLocalHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    const isUploadPath = parsed.pathname.startsWith("/uploads/");

    // Rewrite legacy localhost URLs to current running host/port.
    if (isLocalHost && isUploadPath) {
      return `${origin}${parsed.pathname}${parsed.search}`;
    }

    return rawUrl;
  } catch {
    return rawUrl;
  }
}

/**
 * GET /api/admin/sellers/[sellerId] — full seller detail for admin (profile, stats, bank, KYC, products, orders).
 */
export const GET = withApiHandler(
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
        fileUrl: normalizeUploadUrl(d.fileUrl, request),
        status: d.status,
      })),
      vendorDocuments: (seller.vendorDocuments ?? []).map((d) => ({
        documentName: d.documentName,
        documentUrl: normalizeUploadUrl(d.documentUrl, request),
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
