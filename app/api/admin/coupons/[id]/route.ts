import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiValidationError,
  apiConflict,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";
import { parseCouponBody, serializeCoupon } from "@/lib/admin/coupons";

function routeParamId(params: Record<string, string | string[] | undefined>, key: string): string {
  const v = params[key];
  if (typeof v === "string" && v.trim()) return v.trim();
  if (Array.isArray(v) && typeof v[0] === "string" && v[0].trim()) return v[0].trim();
  return "";
}

/**
 * GET /api/admin/coupons/[id]
 */
export const GET = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const ctx = await requireAdminPermission(request, "coupons");
  if (ctx instanceof Response) return ctx;

  const params = (context ? await context.params : {}) as Record<string, string | string[] | undefined>;
  const id = routeParamId(params, "id");
  if (!id) return apiBadRequest("Invalid id");

  const row = await prisma.coupon.findFirst({ where: { id } });
  if (!row) return apiNotFound("Coupon not found");
  return apiSuccess({ coupon: serializeCoupon(row) });
});

/**
 * PUT /api/admin/coupons/[id] — update coupon (usedCount never accepted from client).
 */
export const PUT = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const ctx = await requireAdminPermission(request, "coupons");
  if (ctx instanceof Response) return ctx;

  const params = (context ? await context.params : {}) as Record<string, string | string[] | undefined>;
  const id = routeParamId(params, "id");
  if (!id) return apiBadRequest("Invalid id");

  const existing = await prisma.coupon.findFirst({ where: { id } });
  if (!existing) return apiNotFound("Coupon not found");

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

  if (parsed.data.code !== existing.code) {
    const clash = await prisma.coupon.findFirst({
      where: { code: parsed.data.code, id: { not: id } },
      select: { id: true },
    });
    if (clash) {
      return apiConflict(`A coupon with code "${parsed.data.code}" already exists`);
    }
  }

  try {
    const row = await prisma.coupon.update({
      where: { id },
      data: {
        code: parsed.data.code,
        discountType: parsed.data.discountType,
        discountValue: parsed.data.discountValue,
        validFrom: parsed.data.validFrom,
        validTo: parsed.data.validTo,
        maxUses: parsed.data.maxUses,
        maxUsesPerUser: parsed.data.maxUsesPerUser,
        deletedAt: parsed.data.isActive ? null : existing.deletedAt ?? new Date(),
      },
    });
    return apiSuccess({ coupon: serializeCoupon(row) });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") return apiNotFound("Coupon not found");
      if (e.code === "P2002") {
        return apiConflict(`A coupon with code "${parsed.data.code}" already exists`);
      }
    }
    throw e;
  }
});

/**
 * DELETE /api/admin/coupons/[id] — soft-delete (sets deletedAt). Does not remove the row.
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const ctx = await requireAdminPermission(request, "coupons");
  if (ctx instanceof Response) return ctx;

  const params = (context ? await context.params : {}) as Record<string, string | string[] | undefined>;
  const id = routeParamId(params, "id");
  if (!id) return apiBadRequest("Invalid id");

  const existing = await prisma.coupon.findFirst({
    where: { id },
    select: { id: true, deletedAt: true },
  });
  if (!existing) return apiNotFound("Coupon not found");

  if (existing.deletedAt != null) {
    return apiSuccess({ id, deleted: true, alreadyDeleted: true });
  }

  await prisma.coupon.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return apiSuccess({ id, deleted: true });
});
