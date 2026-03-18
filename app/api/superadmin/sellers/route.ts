import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, createAuditLog } from "@/lib/superadmin-auth";

const PAGE_SIZE = 10;
const SELLER_STATUS_MAP: Record<string, Prisma.SellerWhereInput["status"]> = {
  active: "APPROVED",
  blocked: "SUSPENDED",
  draft: "DRAFT",
  submitted: "SUBMITTED",
  under_review: "UNDER_REVIEW",
  rejected: "REJECTED",
  suspended: "SUSPENDED",
  on_hold: "ON_HOLD",
};

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const statusParam = searchParams.get("status")?.toLowerCase() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? String(PAGE_SIZE), 10) || PAGE_SIZE));

  const where: Prisma.SellerWhereInput = { deletedAt: null };
  if (search) {
    where.OR = [
      { ownerName: { contains: search } },
      { email: { contains: search } },
      { businessName: { contains: search } },
    ];
  }
  const mapped = statusParam ? SELLER_STATUS_MAP[statusParam] : undefined;
  if (mapped) where.status = mapped as any;

  const [sellers, total] = await Promise.all([
    prisma.seller.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ownerName: true,
        businessName: true,
        email: true,
        phone: true,
        status: true,
        statusReason: true,
        createdAt: true,
        _count: { select: { products: true, orderItems: true } },
        kycDocuments: { select: { status: true } },
      },
    }),
    prisma.seller.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const rows = sellers.map((s) => {
    const kycDocs = s.kycDocuments ?? [];
    let kyc = "Pending";
    if (kycDocs.some((d) => d.status === "REJECTED")) kyc = "Rejected";
    else if (kycDocs.length > 0 && kycDocs.every((d) => d.status === "APPROVED")) kyc = "Approved";
    return {
      id: s.id,
      name: s.ownerName ?? "—",
      business: s.businessName,
      email: s.email,
      phone: s.phone ?? "—",
      status: s.status,
      statusReason: s.statusReason ?? null,
      kyc,
      products: s._count.products,
      orders: s._count.orderItems,
      createdAt: s.createdAt,
    };
  });

  return Response.json({ success: true, data: rows, meta: { total, page, pageSize, totalPages } });
}

