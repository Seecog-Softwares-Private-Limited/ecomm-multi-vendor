import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiValidationError,
  Status,
} from "@/lib/api";
import { requireVendorApproved } from "@/lib/auth";
import { getVendorProfile } from "@/lib/data/vendor-profile";
import { getVendorProductsBySellerId } from "@/lib/data/vendor-products";
import { resolveCategoryAndSubCategoryIds } from "@/lib/data/categories";
import { prisma } from "@/lib/prisma";
import {
  createVendorProductSchema,
  parseWithDetails,
} from "@/lib/validation";

/** Map form returnPolicy to Prisma enum */
const RETURN_POLICY_MAP: Record<string, "DAYS_7" | "DAYS_15" | "DAYS_30" | "NO_RETURN"> = {
  "7days": "DAYS_7",
  "10days": "DAYS_15",
  "15days": "DAYS_15",
  "no-return": "NO_RETURN",
};

/**
 * GET /api/vendor/products — list products for the logged-in vendor. Requires approved status.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { sellerId } = await requireVendorApproved(request);

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const products = await getVendorProductsBySellerId(sellerId, dateFrom, dateTo);
  return apiSuccess(products);
});

/**
 * POST /api/vendor/products — create a new product for the logged-in vendor. Requires approved status.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const { sellerId } = await requireVendorApproved(request);

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
  const status = parsed.data.status ?? "DRAFT";

  const imageUrls = parsed.data.imageUrls ?? [];
  const persistentImageUrls = imageUrls.filter(
    (url) => url.startsWith("http://") || url.startsWith("https://")
  );

  const stock = typeof parsed.data.stock === "number" ? parsed.data.stock : Number(parsed.data.stock) || 0;
  const product = await prisma.product.create({
    data: {
      sellerId,
      categoryId: ids.categoryId,
      subCategoryId: ids.subCategoryId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      sku: parsed.data.sku,
      mrp: parsed.data.mrp,
      sellingPrice: parsed.data.sellingPrice,
      gstPercent: parsed.data.gstPercent ?? null,
      stock,
      returnPolicy,
      status,
      images: {
        create: persistentImageUrls.map((url, i) => ({
          url,
          sortOrder: i,
        })),
      },
      specifications: {
        create: (parsed.data.specifications ?? [])
          .filter((s) => s.key.trim() !== "")
          .map((s) => ({ key: s.key, value: s.value })),
      },
      variations: {
        create: (parsed.data.variations ?? []).filter((v) => v.name.trim() !== "").map((v) => ({
          name: v.name,
          values: v.values,
        })),
      },
    },
    select: {
      id: true,
      name: true,
      sku: true,
      status: true,
      createdAt: true,
    },
  });

  return apiSuccess(product, Status.CREATED);
});
