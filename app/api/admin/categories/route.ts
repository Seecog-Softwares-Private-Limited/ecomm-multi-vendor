import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiBadRequest,
  apiConflict,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Normalize slug: lowercase, replace spaces and consecutive dashes with single hyphen. */
function normalizeSlug(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * GET /api/admin/categories — list all categories with subcategories for admin (admin only).
 * Returns id, name, slug, status, createdDate, subcategories[].
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") {
    return apiForbidden("Admin access required");
  }

  const list = await prisma.category.findMany({
    orderBy: [{ deletedAt: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      deletedAt: true,
      subCategories: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          deletedAt: true,
        },
      },
    },
  });

  const rows = list.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    status: c.deletedAt == null ? "Active" : "Inactive",
    createdDate: c.createdAt.toISOString().slice(0, 10),
    subcategories: c.subCategories.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      status: s.deletedAt == null ? "Active" : "Inactive",
      createdDate: s.createdAt.toISOString().slice(0, 10),
    })),
  }));

  return apiSuccess(rows);
});

/**
 * POST /api/admin/categories — create a category or subcategory (admin only).
 * Body: { name: string, slug?: string, status?: "Active" | "Inactive", parentId?: string }.
 * If parentId is provided, creates a subcategory under that category; otherwise creates a root category.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") {
    return apiForbidden("Admin access required");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  if (!body || typeof body !== "object") {
    return apiBadRequest("Body must be an object");
  }

  const { name, slug: rawSlug, status, parentId } = body as {
    name?: string;
    slug?: string;
    status?: string;
    parentId?: string;
  };

  const nameStr = typeof name === "string" ? name.trim() : "";
  if (!nameStr) {
    return apiBadRequest("Category name is required");
  }

  const slug = normalizeSlug(
    typeof rawSlug === "string" && rawSlug.trim() ? rawSlug : nameStr
  );
  if (!slug) {
    return apiBadRequest("Slug is required (or provide a category name with at least one letter)");
  }

  const isActive =
    status === undefined ||
    status === null ||
    String(status).toLowerCase() === "active";

  if (parentId && typeof parentId === "string" && parentId.trim()) {
    const parent = await prisma.category.findFirst({
      where: { id: parentId.trim(), deletedAt: null },
      select: { id: true },
    });
    if (!parent) {
      return apiBadRequest("Parent category not found");
    }
    const existingSub = await prisma.subCategory.findFirst({
      where: { categoryId: parent.id, slug },
      select: { id: true },
    });
    if (existingSub) {
      return apiConflict(`A subcategory with slug "${slug}" already exists in this category`);
    }
    const sub = await prisma.subCategory.create({
      data: {
        categoryId: parent.id,
        name: nameStr,
        slug,
        deletedAt: isActive ? null : new Date(),
      },
      select: { id: true, name: true, slug: true, createdAt: true, deletedAt: true },
    });
    return apiSuccess(
      {
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        status: sub.deletedAt == null ? "Active" : "Inactive",
        createdDate: sub.createdAt.toISOString().slice(0, 10),
        parentId: parent.id,
      },
      201
    );
  }

  const existing = await prisma.category.findFirst({
    where: { slug },
    select: { id: true },
  });
  if (existing) {
    return apiConflict(`A category with slug "${slug}" already exists`);
  }

  const category = await prisma.category.create({
    data: {
      name: nameStr,
      slug,
      deletedAt: isActive ? null : new Date(),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      deletedAt: true,
    },
  });

  return apiSuccess(
    {
      id: category.id,
      name: category.name,
      slug: category.slug,
      status: category.deletedAt == null ? "Active" : "Inactive",
      createdDate: category.createdAt.toISOString().slice(0, 10),
    },
    201
  );
});
