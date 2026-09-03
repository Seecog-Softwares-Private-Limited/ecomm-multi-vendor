import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiValidationError,
  apiConflict,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";
import { parseCouponBody, serializeCoupon } from "@/lib/admin/coupons";

/**
 * GET /api/admin/coupons — list coupons (admin, coupons permission).
 * Query: q (search code), status=Active|Inactive|all
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "coupons");
  if (ctx instanceof Response) return ctx;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const statusFilter = (searchParams.get("status") ?? "all").trim().toLowerCase();

  const where: Prisma.CouponWhereInput = {};
  if (q) {
    where.code = { contains: q.toUpperCase() };
  }
  if (statusFilter === "active") {
    where.deletedAt = null;
  } else if (statusFilter === "inactive") {
    where.deletedAt = { not: null };
  }

  const rows = await prisma.coupon.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
  });

  return apiSuccess({
    coupons: rows.map(serializeCoupon),
  });
});

/**
 * POST /api/admin/coupons — create coupon.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "coupons");
  if (ctx instanceof Response) return ctx;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const parsed = parseCouponBody(body);
  if (!parsed.ok) {
    return apiValidationError(parsed.message, parsed.fields ? { fields: parsed.fields } : undefined);
  }

  const existing = await prisma.coupon.findFirst({
    where: { code: parsed.data.code },
    select: { id: true },
  });
  if (existing) {
    return apiConflict(`A coupon with code "${parsed.data.code}" already exists`);
  }

  try {
    const row = await prisma.coupon.create({
      data: {
        code: parsed.data.code,
        discountType: parsed.data.discountType,
        discountValue: parsed.data.discountValue,
        validFrom: parsed.data.validFrom,
        validTo: parsed.data.validTo,
        maxUses: parsed.data.maxUses,
        deletedAt: parsed.data.isActive ? null : new Date(),
      },
    });
    return apiSuccess({ coupon: serializeCoupon(row) }, Status.CREATED);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return apiConflict(`A coupon with code "${parsed.data.code}" already exists`);
    }
    throw e;
  }
});
