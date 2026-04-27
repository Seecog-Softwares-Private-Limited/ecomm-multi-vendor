import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiNotFound,
  apiBadRequest,
  type ApiRouteContext,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/categories/[categoryId]/document-requirements — list document requirements for a category (admin only).
 */
export const GET = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") return apiForbidden("Admin access required");

  const params = context ? await context.params : {};
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : "";
  if (!categoryId) return apiNotFound("Category not found");

  const category = await prisma.category.findFirst({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) return apiNotFound("Category not found");

  const list = await prisma.categoryDocumentRequirement.findMany({
    where: { categoryId, deletedAt: null },
    select: { id: true, documentName: true, isRequired: true },
  });

  return apiSuccess(list);
});

/**
 * POST /api/admin/categories/[categoryId]/document-requirements — add a document requirement (admin only).
 * Body: { documentName: string, isRequired?: boolean }.
 */
export const POST = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") return apiForbidden("Admin access required");

  const params = context ? await context.params : {};
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : "";
  if (!categoryId) return apiNotFound("Category not found");

  const category = await prisma.category.findFirst({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) return apiNotFound("Category not found");

  let body: { documentName?: string; isRequired?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  const documentName = typeof body.documentName === "string" ? body.documentName.trim() : "";
  if (!documentName) return apiBadRequest("documentName is required");
  const isRequired = body.isRequired === true;

  const created = await prisma.categoryDocumentRequirement.create({
    data: { categoryId, documentName, isRequired },
    select: { id: true, documentName: true, isRequired: true },
  });
  return apiSuccess(created, 201);
});

/**
 * DELETE /api/admin/categories/[categoryId]/document-requirements — remove a document requirement (admin only).
 * Body: { id: string } (requirement id).
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") return apiForbidden("Admin access required");

  const params = context ? await context.params : {};
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : "";
  if (!categoryId) return apiNotFound("Category not found");

  let body: { id?: string } = {};
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) return apiBadRequest("id is required");

  const requirement = await prisma.categoryDocumentRequirement.findFirst({
    where: { id, categoryId, deletedAt: null },
    select: { id: true },
  });
  if (!requirement) return apiNotFound("Document requirement not found");

  await prisma.categoryDocumentRequirement.update({
    where: { id: requirement.id },
    data: { deletedAt: new Date() },
  });
  return apiSuccess({ deleted: true });
});
