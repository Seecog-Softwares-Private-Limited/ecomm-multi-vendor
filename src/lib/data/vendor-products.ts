import { prisma } from "@/lib/prisma";
import { coalesceVariantImagesFromDb } from "@/lib/product-sku-variant";

const toNumber = (v: unknown): number => (typeof v === "number" ? v : Number(v) ?? 0);

/** UI-friendly status for vendor product list (StatusBadge). */
export type VendorProductStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "inactive"
  /** Shown for rows in trash (soft-deleted); not a Prisma enum. */
  | "deleted";

function mapProductStatus(
  status: string
): VendorProductStatus {
  switch (status) {
    case "DRAFT":
      return "draft";
    case "PENDING_APPROVAL":
      return "submitted";
    case "ACTIVE":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "INACTIVE":
      return "inactive";
    default:
      return "draft";
  }
}

export interface VendorProductListItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  status: VendorProductStatus;
  /** Reason for rejection from admin (when status is rejected). */
  rejectionReason: string | null;
  lastUpdated: string;
  /** First product image URL for listing thumbnail; null if none. */
  imageUrl: string | null;
  /** When listing trash, ISO time when the product was moved to trash. */
  deletedAt?: string | null;
}

export type VendorProductListOptions = {
  dateFrom?: string;
  dateTo?: string;
  /** When true, return only soft-deleted products (trash). */
  trash?: boolean;
};

/**
 * List products for a seller by seller id (for vendor dashboard).
 * Optional dateFrom/dateTo filter by product.updatedAt (YYYY-MM-DD) for reports.
 * Pass `trash: true` to list soft-deleted products only.
 */
export async function getVendorProductsBySellerId(
  sellerId: string,
  options?: VendorProductListOptions
): Promise<VendorProductListItem[]> {
  const { dateFrom, dateTo, trash } = options ?? {};
  const updatedFilter: { gte?: Date; lte?: Date } = {};
  if (dateFrom) updatedFilter.gte = new Date(dateFrom + "T00:00:00.000Z");
  if (dateTo) updatedFilter.lte = new Date(dateTo + "T23:59:59.999Z");
  const hasUpdatedFilter = dateFrom || dateTo;

  const list = await prisma.product.findMany({
    where: {
      sellerId,
      ...(trash ? { deletedAt: { not: null } } : { deletedAt: null }),
      ...(hasUpdatedFilter && { updatedAt: updatedFilter }),
    },
    orderBy: trash ? { deletedAt: "desc" } : { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
      subCategory: { select: { name: true } },
      images: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });

  return list.map((p) => ({
    id: p.id,
    name: p.name,
    category: `${p.category.name} > ${p.subCategory.name}`,
    sku: p.sku,
    price: toNumber(p.sellingPrice),
    stock: p.stock,
    status: trash ? "deleted" : mapProductStatus(p.status),
    rejectionReason: p.rejectionReason ?? null,
    lastUpdated: formatRelativeTime(p.updatedAt),
    imageUrl: p.images[0]?.url ?? null,
    deletedAt: trash ? (p.deletedAt?.toISOString() ?? null) : null,
  }));
}

/**
 * Get seller id by email (Seller table has its own email).
 * Use when the logged-in user has role SELLER and we identify seller by same email.
 */
export async function getSellerIdByEmail(email: string): Promise<string | null> {
  const seller = await prisma.seller.findFirst({
    where: { email: email.trim().toLowerCase(), deletedAt: null },
    select: { id: true },
  });
  return seller?.id ?? null;
}

/** Form-friendly product for edit page (category/subcategory as slugs). */
export interface VendorProductForEdit {
  id: string;
  name: string;
  description: string | null;
  categorySlug: string;
  subCategorySlug: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  gstPercent: number | null;
  stock: number;
  returnPolicy: "no-return" | "7days" | "10days" | "15days";
  status: string;
  /** Reason for rejection from admin (when status is REJECTED). */
  rejectionReason: string | null;
  imageUrls: string[];
  specifications: { key: string; value: string }[];
  variations: { name: string; values: string[] }[];
  /** SKU-level variants (color/size + price/stock); empty if simple product. */
  skuVariants: {
    id: string;
    color: string | null;
    size: string | null;
    price: number;
    stock: number;
    sku: string | null;
    image: string | null;
  }[];
}

const RETURN_POLICY_TO_FORM: Record<string, "no-return" | "7days" | "10days" | "15days"> = {
  DAYS_7: "7days",
  DAYS_15: "15days",
  DAYS_30: "15days",
  NO_RETURN: "no-return",
};

/**
 * Get a single product by id for the given seller (for edit page).
 * Returns null if not found or not owned by seller.
 */
export async function getVendorProductForEdit(
  productId: string,
  sellerId: string
): Promise<VendorProductForEdit | null> {
  const product = await prisma.product.findFirst({
    where: { id: productId, sellerId, deletedAt: null },
    include: {
      category: { select: { slug: true } },
      subCategory: { select: { slug: true } },
      images: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { url: true } },
      specifications: { where: { deletedAt: null }, select: { key: true, value: true } },
      variations: { where: { deletedAt: null }, select: { name: true, values: true } },
      productVariants: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          color: true,
          size: true,
          price: true,
          stock: true,
          sku: true,
          image: true,
          images: true,
        },
      },
    },
  });
  if (!product) return null;

  const valuesFromJson = (v: unknown): string[] =>
    Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x : String(x))) : [];

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? null,
    categorySlug: product.category.slug,
    subCategorySlug: product.subCategory.slug,
    sku: product.sku,
    mrp: toNumber(product.mrp),
    sellingPrice: toNumber(product.sellingPrice),
    gstPercent: product.gstPercent != null ? toNumber(product.gstPercent) : null,
    stock: product.stock,
    returnPolicy: RETURN_POLICY_TO_FORM[product.returnPolicy] ?? "7days",
    status: product.status,
    rejectionReason: product.rejectionReason ?? null,
    imageUrls: (product.images ?? []).map((i) => i.url),
    specifications: product.specifications.map((s) => ({ key: s.key, value: s.value })),
    variations: product.variations.map((v) => ({
      name: v.name,
      values: valuesFromJson(v.values),
    })),
    skuVariants: (product.productVariants ?? []).map((v) => {
      const imgs = coalesceVariantImagesFromDb(v.images, v.image);
      return {
        id: v.id,
        color: v.color ?? null,
        size: v.size ?? null,
        price: toNumber(v.price),
        stock: v.stock,
        sku: v.sku ?? null,
        image: imgs[0] ?? null,
        images: imgs,
      };
    }),
  };
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}
