import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  apiBadRequest,
  apiValidationError,
} from "@/lib/api";
import { requireVendorApproved } from "@/lib/auth";
import { getVendorProfile } from "@/lib/data/vendor-profile";
import { getVendorProductForEdit } from "@/lib/data/vendor-products";
import { resolveCategoryAndSubCategoryIds } from "@/lib/data/categories";
import { prisma } from "@/lib/prisma";
import { normalizeVendorSkuVariants } from "@/lib/product-sku-variant";
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

type RouteContext = { params: Promise<Record<string, string | string[]>> };

/**
 * GET /api/vendor/products/:productId — fetch one product for edit. Requires approved status.
 */
export const GET = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const { sellerId } = await requireVendorApproved(request);

  const params = context ? await context.params : {};
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
 * PUT /api/vendor/products/:productId — update product. Requires approved status.
 */
export const PUT = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const { sellerId } = await requireVendorApproved(request);

  const params = context ? await context.params : {};
  const productId = typeof params.productId === "string" ? params.productId : params.productId?.[0];
  const parsedId = uuid.safeParse(productId ?? "");
  if (!parsedId.success) {
    return apiBadRequest("Invalid product ID");
  }
  const id = parsedId.data;

  const existing = await prisma.product.findFirst({
    where: { id, sellerId, deletedAt: null },
    select: { id: true, status: true },
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

  const profile = await getVendorProfile(sellerId);
  const allowedIds = profile?.allowedCategoryIds ?? (profile?.primaryCategoryId ? [profile.primaryCategoryId] : []);
  if (allowedIds.length > 0 && !allowedIds.includes(ids.categoryId)) {
    return apiValidationError("You can add products only in categories selected in your Profile & KYC.", {
      categorySlug: "Select this category in Profile & KYC first",
    });
  }
  if (allowedIds.length === 0) {
    return apiValidationError("Select at least one category in Profile & KYC before adding products.", {
      categorySlug: "Go to Profile & KYC and select categories you sell in",
    });
  }

  const returnPolicy =
    RETURN_POLICY_MAP[parsed.data.returnPolicy ?? "7days"] ?? "DAYS_7";
  // Any update to a previously submitted/approved product must be re-approved by admin.
  const status =
    existing.status === "DRAFT"
      ? (parsed.data.status ?? "DRAFT")
      : "PENDING_APPROVAL";

  const imageUrls = parsed.data.imageUrls ?? [];
  const persistentImageUrls = imageUrls.filter(
    (url) => url.startsWith("http://") || url.startsWith("https://")
  );

  const stockBase = typeof parsed.data.stock === "number" ? parsed.data.stock : Number(parsed.data.stock) || 0;
  const skuRows = normalizeVendorSkuVariants(parsed.data.variants);
  const hasSkuVariants = skuRows.length > 0;
  const stock = hasSkuVariants ? skuRows.reduce((s, r) => s + r.stock, 0) : stockBase;
  const sellingPrice = hasSkuVariants ? Math.min(...skuRows.map((r) => r.price)) : parsed.data.sellingPrice;

  await prisma.product.update({
    where: { id },
    data: {
      categoryId: ids.categoryId,
      subCategoryId: ids.subCategoryId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      sku: parsed.data.sku,
      mrp: parsed.data.mrp,
      sellingPrice,
      gstPercent: parsed.data.gstPercent ?? null,
      stock,
      returnPolicy,
      status,
      rejectionReason: null,
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
      productVariants: {
        deleteMany: {},
        ...(hasSkuVariants
          ? {
              create: skuRows.map((v, i) => ({
                color: v.color,
                size: v.size,
                price: v.price,
                stock: v.stock,
                sku: v.sku,
                image: v.image,
                ...(v.images.length > 0 ? { images: v.images } : {}),
                sortOrder: i,
              })),
            }
          : {}),
      },
    },
  });

  const updated = await getVendorProductForEdit(id, sellerId);
  return apiSuccess(updated ?? { id });
});

/**
 * DELETE /api/vendor/products/:productId — soft-delete product. Requires approved status.
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const { sellerId } = await requireVendorApproved(request);

  const params = context ? await context.params : {};
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
