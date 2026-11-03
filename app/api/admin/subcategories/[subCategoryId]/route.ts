import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  apiBadRequest,
  apiConflict,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";
import { normalizeSlug } from "@/lib/category-slug";

/**
 * PUT /api/admin/subcategories/[subCategoryId] — update a subcategory (admin only).
 * Body: { name?: string, slug?: string, status?: "Active" | "Inactive" }.
 */
export const PUT = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const ctx = await requireAdminPermission(request, "categories");
  if (ctx instanceof Response) return ctx;

  const params = context ? await context.params : {};
  const subCategoryId = typeof params.subCategoryId === "string" ? params.subCategoryId : "";
  if (!subCategoryId) return apiNotFound("Subcategory not found");

  const sub = await prisma.subCategory.findFirst({
    where: { id: subCategoryId },
    select: { id: true, categoryId: true, name: true, slug: true },
  });
  if (!sub) return apiNotFound("Subcategory not found");

  let body: { name?: string; slug?: string; status?: string } = {};
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const nameStr = typeof body.name === "string" ? body.name.trim() : sub.name;
  if (!nameStr) return apiBadRequest("Subcategory name is required");
  const rawSlug = typeof body.slug === "string" ? body.slug.trim() : sub.slug;
  const slug = normalizeSlug(rawSlug || nameStr);
  if (!slug) return apiBadRequest("Subcategory name or slug is required");

  const isActive =
    body.status === undefined ||
    body.status === null ||
    String(body.status).toLowerCase() === "active";

  // Unique across active and inactive rows, matching the @@unique([categoryId, slug]) constraint.
  const existingBySlug = await prisma.subCategory.findFirst({
    where: { categoryId: sub.categoryId, slug, id: { not: subCategoryId } },
    select: { id: true },
  });
  if (existingBySlug) {
    return apiConflict(`A subcategory with slug "${slug}" already exists in this category`);
  }

  const updated = await prisma.subCategory.update({
    where: { id: subCategoryId },
    data: { name: nameStr, slug, deletedAt: isActive ? null : new Date() },
    select: { id: true, name: true, slug: true, createdAt: true, deletedAt: true },
  });

  return apiSuccess({
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    status: updated.deletedAt == null ? "Active" : "Inactive",
    createdDate: updated.createdAt.toISOString().slice(0, 10),
  });
});

/**
 * DELETE /api/admin/subcategories/[subCategoryId] — soft-delete a subcategory (admin only).
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const ctx = await requireAdminPermission(request, "categories");
  if (ctx instanceof Response) return ctx;

  const params = context ? await context.params : {};
  const subCategoryId = typeof params.subCategoryId === "string" ? params.subCategoryId : "";
  if (!subCategoryId) return apiNotFound("Subcategory not found");

  const sub = await prisma.subCategory.findFirst({
    where: { id: subCategoryId },
    select: { id: true, deletedAt: true },
  });
  if (!sub) return apiNotFound("Subcategory not found");

  if (sub.deletedAt != null) {
    return apiSuccess({ id: subCategoryId, deleted: true, alreadyDeleted: true });
  }

  await prisma.subCategory.update({
    where: { id: subCategoryId },
    data: { deletedAt: new Date() },
  });

  return apiSuccess({ id: subCategoryId, deleted: true });
});
