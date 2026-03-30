import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiNotFound,
  apiValidationError,
  apiInternalError,
  type ApiRouteContext,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

function routeParamId(params: Record<string, string | string[] | undefined>, key: string): string {
  const v = params[key];
  if (typeof v === "string" && v.trim()) return v.trim();
  if (Array.isArray(v) && typeof v[0] === "string" && v[0].trim()) return v[0].trim();
  return "";
}

function parseSortOrder(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && /^-?\d+$/.test(v.trim())) return parseInt(v.trim(), 10);
  return 0;
}

function parsePublished(v: unknown): boolean {
  return v !== false && v !== "false" && v !== 0 && v !== "0";
}

function parseDescription(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v !== "string") return null;
  const s = v.replace(/\r\n/g, "\n").trim();
  if (!s) return null;
  return s.slice(0, 65535);
}

function parseBody(body: unknown): {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  published: boolean;
  sortOrder: number;
  description: string | null;
} | null {
  if (typeof body !== "object" || body === null) return null;
  const o = body as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const department = typeof o.department === "string" ? o.department.trim() : "";
  const location = typeof o.location === "string" ? o.location.trim() : "";
  const employmentType = typeof o.employmentType === "string" ? o.employmentType.trim() : "";
  const published = parsePublished(o.published);
  const sortOrder = parseSortOrder(o.sortOrder);
  const description = parseDescription(o.description);
  if (!title || !department || !location || !employmentType) return null;
  return { title, department, location, employmentType, published, sortOrder, description };
}

/**
 * GET /api/admin/cms/career-openings/[id]
 */
export const GET = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const ctx = await requireAdminPermission(request, "cms");
  if (ctx instanceof Response) return ctx;

  const params = (context ? await context.params : {}) as Record<string, string | string[] | undefined>;
  const id = routeParamId(params, "id");
  if (!id) return apiBadRequest("Invalid id");

  const row = await prisma.careerOpening.findUnique({ where: { id } });
  if (!row) return apiNotFound();
  return apiSuccess(row);
});

/**
 * PUT /api/admin/cms/career-openings/[id]
 */
export const PUT = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const ctx = await requireAdminPermission(request, "cms");
  if (ctx instanceof Response) return ctx;

  const params = (context ? await context.params : {}) as Record<string, string | string[] | undefined>;
  const id = routeParamId(params, "id");
  if (!id) return apiBadRequest("Invalid id");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  const parsed = parseBody(body);
  if (!parsed) {
    return apiValidationError("Validation failed", {
      fields: "title, department, location, and employmentType are required",
    });
  }

  try {
    const row = await prisma.careerOpening.update({
      where: { id },
      data: {
        title: parsed.title.slice(0, 255),
        department: parsed.department.slice(0, 255),
        location: parsed.location.slice(0, 255),
        employmentType: parsed.employmentType.slice(0, 120),
        published: parsed.published,
        sortOrder: parsed.sortOrder,
        description: parsed.description,
      },
    });
    return apiSuccess({ opening: row });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return apiNotFound(
        "This job opening was not found. It may have been deleted — refresh the list and try again."
      );
    }
    if (e instanceof Prisma.PrismaClientValidationError) {
      console.error("[api] career-openings PUT validation:", e.message.slice(0, 500));
      return apiValidationError(
        "The app’s Prisma client is out of sync with the schema. Stop the dev server, run npx prisma generate, then start again.",
        { prisma: e.message.slice(0, 300) }
      );
    }
    console.error("[api] career-openings PUT", id, e);
    return apiInternalError(
      "Could not save this opening. Confirm the database has the latest migrations (npx prisma migrate deploy), run npx prisma generate, then restart the server."
    );
  }
});

/**
 * DELETE /api/admin/cms/career-openings/[id]
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const ctx = await requireAdminPermission(request, "cms");
  if (ctx instanceof Response) return ctx;

  const params = (context ? await context.params : {}) as Record<string, string | string[] | undefined>;
  const id = routeParamId(params, "id");
  if (!id) return apiBadRequest("Invalid id");

  try {
    await prisma.careerOpening.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return apiNotFound("This job opening was not found. Refresh the list and try again.");
    }
    console.error("[api] career-openings DELETE", id, e);
    return apiInternalError("Could not delete this opening.");
  }
});
