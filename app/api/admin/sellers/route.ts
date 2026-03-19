import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

const PAGE_SIZE = 10;
const SELLER_STATUS_MAP: Record<string, "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "SUSPENDED"> = {
  active: "APPROVED",
  blocked: "SUSPENDED",
  draft: "DRAFT",
  submitted: "SUBMITTED",
  rejected: "REJECTED",
  suspended: "SUSPENDED",
};
const KYC_STATUS_MAP = ["PENDING", "APPROVED", "REJECTED"] as const;

/**
 * GET /api/admin/sellers — list sellers (admin only).
 * Query: search, status (active|blocked|draft|submitted|approved|rejected|suspended), kycStatus (pending|approved|rejected), page, pageSize.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "sellers");
  if (ctx instanceof Response) return ctx;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const statusParam = searchParams.get("status")?.toLowerCase() ?? "";
  const kycParam = searchParams.get("kycStatus")?.toLowerCase() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? String(PAGE_SIZE), 10) || PAGE_SIZE));

  const where: Prisma.SellerWhereInput = {
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      { ownerName: { contains: search } },
      { email: { contains: search } },
      { businessName: { contains: search } },
    ];
  }

  const sellerStatus = statusParam ? SELLER_STATUS_MAP[statusParam] : undefined;
  if (sellerStatus) {
    where.status = sellerStatus;
  }

  if (kycParam && KYC_STATUS_MAP.includes(kycParam.toUpperCase() as (typeof KYC_STATUS_MAP)[number])) {
    const kyc = kycParam.toUpperCase();
    if (kyc === "REJECTED") {
      where.kycDocuments = { some: { status: "REJECTED" } };
    } else if (kyc === "APPROVED") {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        { kycDocuments: { some: {} } },
        { kycDocuments: { none: { status: "PENDING" } } },
        { kycDocuments: { none: { status: "REJECTED" } } },
      ];
      delete where.kycDocuments;
    } else {
      // PENDING: has no docs or has some PENDING and no REJECTED
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { kycDocuments: { none: {} } },
            {
              AND: [
                { kycDocuments: { some: { status: "PENDING" } } },
                { kycDocuments: { none: { status: "REJECTED" } } },
              ],
            },
          ],
        },
      ];
      delete where.kycDocuments;
    }
  }

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
        _count: {
          select: {
            products: true,
            orderItems: true,
          },
        },
        kycDocuments: {
          select: { status: true },
        },
      },
    }),
    prisma.seller.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const rows = sellers.map((s) => {
    const kycDocs = s.kycDocuments ?? [];
    let kycStatus = "Pending";
    if (kycDocs.some((d) => d.status === "REJECTED")) kycStatus = "Rejected";
    else if (kycDocs.length > 0 && kycDocs.every((d) => d.status === "APPROVED")) kycStatus = "Approved";

    const statusDisplay =
      s.status === "APPROVED" ? "Active" : s.status === "SUSPENDED" ? "Blocked" : s.status;

    return {
      id: s.id,
      name: s.ownerName ?? "—",
      business: s.businessName,
      email: s.email,
      phone: s.phone ?? "—",
      kyc: kycStatus,
      products: s._count.products,
      orders: s._count.orderItems,
      status: statusDisplay,
    };
  });

  return apiSuccess(rows, 200, {
    total,
    page,
    pageSize,
    totalPages,
  });
});
