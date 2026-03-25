/**
 * Reusable Zod schemas for API input validation.
 * Use these to build request-specific schemas and keep type inference.
 */

import { z } from "zod";

/** UUID v4 format (hex segments 8-4-4-4-12). */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Non-empty string, trimmed. */
export const requiredString = z.string().min(1, "Required").trim();

/** UUID path/query param. */
export const uuid = z
  .string()
  .min(1, "ID is required")
  .regex(UUID_REGEX, "Invalid ID format");

/** Optional slug (trimmed, lowercase); empty string becomes undefined. */
export const slug = z
  .string()
  .max(200)
  .transform((s) => {
    const t = s.trim().toLowerCase();
    return t === "" ? undefined : t;
  })
  .optional();

/** Positive integer, e.g. for limit. Default max 100. */
export const limitSchema = z
  .union([z.string().regex(/^\d+$/).transform(Number), z.number()])
  .pipe(z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100"))
  .optional();

/** Non-negative integer, e.g. for offset. */
export const offsetSchema = z
  .union([z.string().regex(/^\d+$/).transform(Number), z.number()])
  .pipe(z.number().int().min(0, "Offset must be 0 or greater"))
  .optional();

/** Single limit query param (reused for reviews, questions). */
export const limitQuerySchema = z
  .union([z.string().regex(/^\d+$/).transform(Number), z.number()])
  .pipe(z.number().int().min(1).max(100))
  .optional();

// --- API-specific schemas ---

/** Optional search query (trimmed, max 200 chars); empty string becomes undefined. */
const searchQueryParam = z
  .string()
  .max(200)
  .transform((s) => {
    const t = s?.trim();
    return t === "" ? undefined : t;
  })
  .optional();

/** Optional 6-digit Indian PIN from query string. */
const pincodeQueryParam = z
  .string()
  .optional()
  .transform((s) => {
    if (!s?.trim()) return undefined;
    const d = s.replace(/\D/g, "").slice(0, 6);
    return /^\d{6}$/.test(d) ? d : undefined;
  });

const menuTypeSlug = z
  .enum(["deals", "new-arrivals", "best-sellers"])
  .optional();

/** GET /api/products — query params. */
export const getProductsQuerySchema = z.object({
  categorySlug: slug,
  subCategorySlug: slug,
  q: searchQueryParam,
  limit: limitSchema,
  offset: offsetSchema,
  pincode: pincodeQueryParam,
  menuType: menuTypeSlug,
});

export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;

/** Path params for /api/products/:id (and nested routes). */
export const productIdParamSchema = z.object({
  id: uuid,
});

export type ProductIdParam = z.infer<typeof productIdParamSchema>;

/** GET /api/products/:id/reviews or /questions — query (limit only). */
export const limitOnlyQuerySchema = z.object({
  limit: limitQuerySchema,
});

export type LimitOnlyQuery = z.infer<typeof limitOnlyQuerySchema>;

// --- Vendor create product (POST /api/vendor/products) ---

const createProductSlug = z.string().min(1, "Required").max(200).trim().toLowerCase();
const priceSchema = z.union([z.string().regex(/^\d*(\.\d+)?$/).transform(Number), z.number()]).pipe(z.number().min(0));
const stockSchema = z.union([z.string().regex(/^\d+$/).transform(Number), z.number()]).pipe(z.number().int().min(0));
const returnPolicyForm = z.enum(["no-return", "7days", "10days", "15days"]);
const productStatusSubmit = z.enum(["DRAFT", "PENDING_APPROVAL"]);

export const createVendorProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(500).trim(),
  description: z.string().max(10000).trim().optional(),
  categorySlug: createProductSlug,
  subCategorySlug: createProductSlug,
  sku: z.string().min(1, "SKU is required").max(100).trim(),
  mrp: priceSchema,
  sellingPrice: priceSchema,
  gstPercent: z.union([z.string().regex(/^\d*(\.\d+)?$/).transform(Number), z.number()]).pipe(z.number().min(0).max(100)).optional(),
  stock: stockSchema,
  returnPolicy: returnPolicyForm.optional(),
  status: productStatusSubmit.optional(),
  imageUrls: z.array(z.string().max(500)).max(10).optional(),
  specifications: z.array(z.object({ key: z.string().max(100).trim(), value: z.string().max(500).trim() })).optional(),
  variations: z.array(z.object({ name: z.string().max(100).trim(), values: z.array(z.string().max(100)) })).optional(),
});

export type CreateVendorProductInput = z.infer<typeof createVendorProductSchema>;

/** 6-digit Indian PIN (digits only after transform). */
export const indianPincodeField = z
  .string()
  .min(1, "PIN is required")
  .transform((s) => s.replace(/\D/g, "").slice(0, 6))
  .refine((d) => /^\d{6}$/.test(d), "Enter a valid 6-digit PIN");

/** POST /api/vendor/service-pincodes — single PIN */
export const vendorAddServicePincodeSchema = z.object({
  pincode: indianPincodeField,
});

export type VendorAddServicePincodeInput = z.infer<typeof vendorAddServicePincodeSchema>;

/** POST /api/vendor/service-pincodes — single PIN or pasted list (newlines / commas) */
export const vendorAddServicePincodesBodySchema = z.union([
  z.object({ pincode: indianPincodeField }),
  z.object({
    bulkText: z
      .string()
      .max(50_000, "Too many characters")
      .transform((s) => s.trim())
      .refine((s) => s.length > 0, { message: "Paste at least one PIN" }),
  }),
]);

export type VendorAddServicePincodesBody = z.infer<typeof vendorAddServicePincodesBodySchema>;

/** PATCH /api/vendor/service-pincodes — delivery scope toggle */
export const vendorDeliveryScopePatchSchema = z.object({
  restrictDeliveryToPincodes: z.boolean(),
});

export type VendorDeliveryScopePatch = z.infer<typeof vendorDeliveryScopePatchSchema>;
