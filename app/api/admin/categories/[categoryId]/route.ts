import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiNotFound,
  apiBadRequest,
  apiConflict,
  type ApiRouteContext,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeSlug(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * PUT /api/admin/categories/[categoryId] — update a category (admin only).
 * Body: { name?: string, slug?: string, status?: "Active" | "Inactive" }.
 */
export const PUT = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") return apiForbidden("Admin access required");

  const params = context ? await context.params : {};
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : "";
  if (!categoryId) return apiNotFound("Category not found");

  const category = await prisma.category.findFirst({
    where: { id: categoryId, deletedAt: null },
    select: { id: true, name: true, slug: true },
  });
  if (!category) return apiNotFound("Category not found");

  let body: { name?: string; slug?: string; status?: string } = {};
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const nameStr = typeof body.name === "string" ? body.name.trim() : category.name;
  const rawSlug = typeof body.slug === "string" ? body.slug.trim() : category.slug;
  const slug = normalizeSlug(rawSlug || nameStr);
  if (!slug) return apiBadRequest("Category name or slug is required");

  const isActive =
    body.status === undefined ||
    body.status === null ||
    String(body.status).toLowerCase() === "active";

  const existingBySlug = await prisma.category.findFirst({
    where: { slug, id: { not: categoryId }, deletedAt: null },
    select: { id: true },
  });
  if (existingBySlug) return apiConflict(`A category with slug "${slug}" already exists`);

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: nameStr,
      slug,
      deletedAt: isActive ? null : new Date(),
    },
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
 * DELETE /api/admin/categories/[categoryId] — soft-delete a category (admin only).
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") return apiForbidden("Admin access required");

  const params = context ? await context.params : {};
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : "";
  if (!categoryId) return apiNotFound("Category not found");

  const category = await prisma.category.findFirst({
    where: { id: categoryId, deletedAt: null },
    select: { id: true },
  });
  if (!category) return apiNotFound("Category not found");

  await prisma.category.update({
    where: { id: categoryId },
    data: { deletedAt: new Date() },
  });

  return apiSuccess({ id: categoryId, deleted: true });
});
