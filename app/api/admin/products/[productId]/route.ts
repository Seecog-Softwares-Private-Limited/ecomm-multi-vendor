import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiNotFound,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ productId: string }> };

/**
 * GET /api/admin/products/[productId] — full product details for admin preview (admin only).
 */
export const GET = withApiHandler(
  async (request: NextRequest, context?: RouteContext) => {
    const session = await requireSession(request);
    if (session.role !== "ADMIN") {
      return apiForbidden("Admin access required");
    }

    const params = context?.params;
    const productId = params ? (await params).productId : undefined;
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
      submittedDate: product.createdAt.toISOString().slice(0, 10),
      sellerName: product.seller?.businessName ?? "—",
      categoryName: product.category?.name ?? "—",
      subCategoryName: product.subCategory?.name ?? "—",
      images: product.images.map((img) => ({ id: img.id, url: img.url, sortOrder: img.sortOrder ?? 0 })),
      specifications: product.specifications.map((s) => ({ key: s.key, value: s.value })),
    });
  }
);
