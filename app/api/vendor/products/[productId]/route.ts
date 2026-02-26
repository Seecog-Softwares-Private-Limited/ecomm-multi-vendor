import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiNotFound,
  apiBadRequest,
  apiValidationError,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getVendorProductForEdit } from "@/lib/data/vendor-products";
import { resolveCategoryAndSubCategoryIds } from "@/lib/data/categories";
import { prisma } from "@/lib/prisma";
import {
  createVendorProductSchema,
  parseWithDetails,
  uuid,
} from "@/lib/validation";

/** Map form returnPolicy to Prisma enum */
const RETURN_POLICY_MAP: Record<string, "DAYS_7" | "DAYS_15" | "DAYS_30" | "NO_RETURN"> = {
  "7days": "DAYS_7",
  "10days": "DAYS_15",
  "15days": "DAYS_15",
  "no-return": "NO_RETURN",
};

type RouteContext = { params?: Promise<Record<string, string | string[]>> };

/**
 * GET /api/vendor/products/:productId — fetch one product for edit (vendor must own it).
 */
export const GET = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }
  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) {
    return apiForbidden("Vendor account required");
  }

  const params = context?.params ? await context.params : {};
  const productId = typeof params.productId === "string" ? params.productId : params.productId?.[0];
  const parsedId = uuid.safeParse(productId ?? "");
  if (!parsedId.success) {
    return apiBadRequest("Invalid product ID");
  }
  const id = parsedId.data;

  const product = await getVendorProductForEdit(id, sellerId);
  if (!product) {
    return apiNotFound("Product not found");
  }
  return apiSuccess(product);
});

/**
 * PUT /api/vendor/products/:productId — update product (vendor must own it).
 */
export const PUT = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }
  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) {
    return apiForbidden("Vendor account required");
  }

  const params = context?.params ? await context.params : {};
  const productId = typeof params.productId === "string" ? params.productId : params.productId?.[0];
  const parsedId = uuid.safeParse(productId ?? "");
  if (!parsedId.success) {
    return apiBadRequest("Invalid product ID");
  }
  const id = parsedId.data;

  const existing = await prisma.product.findFirst({
    where: { id, sellerId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) return apiNotFound("Product not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const parsed = parseWithDetails(createVendorProductSchema, body);
  if (!parsed.success) {
    return apiValidationError("Validation failed", parsed.details);
  }

  const ids = await resolveCategoryAndSubCategoryIds(
    parsed.data.categorySlug,
    parsed.data.subCategorySlug
  );
  if (!ids) {
    return apiValidationError("Invalid category or sub-category", {
      categorySlug: "Category or sub-category not found",
    });
  }

  const returnPolicy =
    RETURN_POLICY_MAP[parsed.data.returnPolicy ?? "7days"] ?? "DAYS_7";
  const status = parsed.data.status ?? "DRAFT";

  const imageUrls = parsed.data.imageUrls ?? [];
  const persistentImageUrls = imageUrls.filter(
    (url) => url.startsWith("http://") || url.startsWith("https://")
  );

  await prisma.product.update({
    where: { id },
    data: {
      categoryId: ids.categoryId,
      subCategoryId: ids.subCategoryId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      sku: parsed.data.sku,
      mrp: parsed.data.mrp,
      sellingPrice: parsed.data.sellingPrice,
      gstPercent: parsed.data.gstPercent ?? null,
      stock: parsed.data.stock,
      returnPolicy,
      status,
      images: {
        deleteMany: {},
        create: persistentImageUrls.map((url, i) => ({
          url,
          sortOrder: i,
        })),
      },
      specifications: {
        deleteMany: {},
        create: (parsed.data.specifications ?? [])
          .filter((s) => s.key.trim() !== "")
          .map((s) => ({ key: s.key, value: s.value })),
      },
      variations: {
        deleteMany: {},
        create: (parsed.data.variations ?? [])
          .filter((v) => v.name.trim() !== "")
          .map((v) => ({ name: v.name, values: v.values })),
      },
    },
  });

  const updated = await getVendorProductForEdit(id, sellerId);
  return apiSuccess(updated ?? { id });
});

/**
 * DELETE /api/vendor/products/:productId — soft-delete product (vendor must own it).
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }
  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) {
    return apiForbidden("Vendor account required");
  }

  const params = context?.params ? await context.params : {};
  const productId = typeof params.productId === "string" ? params.productId : params.productId?.[0];
  const parsedId = uuid.safeParse(productId ?? "");
  if (!parsedId.success) {
    return apiBadRequest("Invalid product ID");
  }
  const id = parsedId.data;

  const existing = await prisma.product.findFirst({
    where: { id, sellerId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) return apiNotFound("Product not found");

  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return apiSuccess({ id, deleted: true });
});
