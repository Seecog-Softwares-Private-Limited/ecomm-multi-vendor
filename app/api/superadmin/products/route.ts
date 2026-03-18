import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin-auth";

const PAGE_SIZE = 10;
const STATUS_MAP: Record<string, "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "INACTIVE"> = {
  draft: "DRAFT",
  pending: "PENDING_APPROVAL",
  approved: "ACTIVE",
  active: "ACTIVE",
  rejected: "REJECTED",
  inactive: "INACTIVE",
};

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status")?.toLowerCase() ?? "";
  const search = searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? String(PAGE_SIZE), 10) || PAGE_SIZE));

  const where: Prisma.ProductWhereInput = { deletedAt: null };
  const productStatus = statusParam ? STATUS_MAP[statusParam] : undefined;
  if (productStatus) where.status = productStatus;
  if (search) where.name = { contains: search };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        sellingPrice: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
        seller: { select: { businessName: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    sellerName: p.seller?.businessName ?? "—",
    categoryName: p.category?.name ?? "—",
    price: Number(p.sellingPrice),
    status: p.status,
    rejectionReason: p.rejectionReason ?? null,
    submittedDate: p.createdAt.toISOString().slice(0, 10),
  }));

  return Response.json({ success: true, data: rows, meta: { total, page, pageSize, totalPages } });
}

