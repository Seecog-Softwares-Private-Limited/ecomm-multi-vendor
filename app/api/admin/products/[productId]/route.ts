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
 * GET /api/admin/products/[productId] — full product details for admin preview (admin only).
 */
export const GET = withApiHandler(
  async (request: NextRequest, context?: ApiRouteContext) => {
    const session = await requireSession(request);
    if (session.role !== "ADMIN") {
      return apiForbidden("Admin access required");
    }

    const params = context ? await context.params : {};
    const productId = typeof params.productId === "string" ? params.productId : "";
    if (!productId) {
      return apiNotFound("Product not found");
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        sku: true,
        mrp: true,
        sellingPrice: true,
        stock: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
        seller: { select: { businessName: true } },
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
        images: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
          select: { id: true, url: true, sortOrder: true },
        },
        specifications: {
          where: { deletedAt: null },
          select: { key: true, value: true },
        },
      },
    });

    if (!product) {
      return apiNotFound("Product not found");
    }

    const statusDisplay =
      product.status === "PENDING_APPROVAL"
        ? "Pending"
        : product.status === "ACTIVE"
          ? "Approved"
          : product.status === "REJECTED"
            ? "Rejected"
            : product.status;

    return apiSuccess({
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      sku: product.sku,
      mrp: Number(product.mrp),
      sellingPrice: Number(product.sellingPrice),
      stock: product.stock,
      status: product.status,
      statusDisplay,
      rejectionReason: product.rejectionReason ?? null,
      submittedDate: product.createdAt.toISOString().slice(0, 10),
      sellerName: product.seller?.businessName ?? "—",
      categoryName: product.category?.name ?? "—",
      subCategoryName: product.subCategory?.name ?? "—",
      images: product.images.map((img) => ({ id: img.id, url: img.url, sortOrder: img.sortOrder ?? 0 })),
      specifications: product.specifications.map((s) => ({ key: s.key, value: s.value })),
    });
  }
);
