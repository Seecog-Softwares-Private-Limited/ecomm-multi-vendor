import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiBadRequest, apiValidationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

function parseSortOrder(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && /^-?\d+$/.test(v.trim())) return parseInt(v.trim(), 10);
  return 0;
}

function parsePublished(v: unknown): boolean {
  return v !== false && v !== "false" && v !== 0 && v !== "0";
}

/** Plain text; empty after trim → null. Max length fits MySQL TEXT. */
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
 * GET /api/admin/cms/career-openings — all openings (admin).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "cms");
  if (ctx instanceof Response) return ctx;

  const rows = await prisma.careerOpening.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return apiSuccess({ openings: rows });
});

/**
 * POST /api/admin/cms/career-openings — create.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "cms");
  if (ctx instanceof Response) return ctx;

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

  const row = await prisma.careerOpening.create({
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
});
