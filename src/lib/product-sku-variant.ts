/**
 * Cart / PDP helpers for SKU-level {@link ProductVariant} rows (color, size, price, stock).
 * variantKey format: Color:<v>|Size:<v> (only non-empty dimensions included, sorted for stability).
 */

export type SkuVariantLike = {
  id?: string;
  color: string | null;
  size: string | null;
  price: number;
  stock: number;
  sku?: string | null;
  image?: string | null;
  /** Populated from API / DB when present. */
  images?: string[] | null;
};

const COLOR_PREFIX = "Color:";
const SIZE_PREFIX = "Size:";

/** Merge URL list from JSON column + legacy `image` (deduped, stable order). */
export function coalesceVariantImagesFromDb(imagesJson: unknown, legacyImage: string | null | undefined): string[] {
  const out: string[] = [];
  const add = (u: string) => {
    const t = u.trim();
    if (!t || out.includes(t)) return;
    out.push(t);
  };
  if (Array.isArray(imagesJson)) {
    for (const x of imagesJson) {
      add(typeof x === "string" ? x : String(x));
    }
  }
  add(legacyImage ?? "");
  return out;
}

/** Normalize vendor input: `images` first, then optional single `image`. */
export function normalizeVariantImageUrls(
  images: string[] | null | undefined,
  image: string | null | undefined
): string[] {
  const out: string[] = [];
  const add = (u: string) => {
    const t = u.trim();
    if (!t || out.includes(t)) return;
    out.push(t);
  };
  for (const u of images ?? []) add(u);
  add(image ?? "");
  return out;
}

/** Build canonical key for cart/checkout (matches PDP add-to-cart). */
export function buildSkuVariantKey(color: string | null | undefined, size: string | null | undefined): string | null {
  const c = color?.trim() || null;
  const s = size?.trim() || null;
  const parts: string[] = [];
  if (c) parts.push(`${COLOR_PREFIX}${c}`);
  if (s) parts.push(`${SIZE_PREFIX}${s}`);
  return parts.length > 0 ? parts.join("|") : null;
}

/** Parse variantKey segments into color/size (null if absent). */
export function parseSkuVariantKey(variantKey: string | null | undefined): { color: string | null; size: string | null } {
  if (!variantKey?.trim()) return { color: null, size: null };
  let color: string | null = null;
  let size: string | null = null;
  for (const part of variantKey.split("|").map((p) => p.trim()).filter(Boolean)) {
    if (part.startsWith(COLOR_PREFIX)) color = part.slice(COLOR_PREFIX.length).trim() || null;
    else if (part.startsWith(SIZE_PREFIX)) size = part.slice(SIZE_PREFIX.length).trim() || null;
  }
  return { color, size };
}

/** Find variant row matching parsed key (trimmed string compare). */
export function findSkuVariantByKey(
  variants: SkuVariantLike[],
  variantKey: string | null | undefined
): SkuVariantLike | null {
  if (!variants.length) return null;
  const { color, size } = parseSkuVariantKey(variantKey ?? null);
  const found = variants.find((v) => {
    const vc = (v.color ?? "").trim() || null;
    const vs = (v.size ?? "").trim() || null;
    const matchColor = (color ?? null) === vc;
    const matchSize = (size ?? null) === vs;
    return matchColor && matchSize;
  });
  return found ?? null;
}

/** Distinct non-empty colors from variants (stable sort). */
export function distinctVariantColors(variants: SkuVariantLike[]): string[] {
  const set = new Set<string>();
  for (const v of variants) {
    const c = v.color?.trim();
    if (c) set.add(c);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Sizes available for optional selected color; if no color filter, all distinct sizes. */
export function distinctVariantSizes(variants: SkuVariantLike[], selectedColor: string | null): string[] {
  const filtered =
    selectedColor?.trim()
      ? variants.filter((v) => (v.color?.trim() || "") === selectedColor.trim())
      : variants;
  const set = new Set<string>();
  for (const v of filtered) {
    const s = v.size?.trim();
    if (s) set.add(s);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Normalized rows for Prisma after Zod — drops blank lines; allows single default row without dimensions. */
export type NormalizedVendorSkuVariant = {
  color: string | null;
  size: string | null;
  price: number;
  stock: number;
  sku: string | null;
  image: string | null;
  images: string[];
};

/** More than one row OR any row has color/size → client must send an explicit variantKey. */
export function skuVariantsRequireExplicitKey(
  rows: Array<{ color: string | null; size: string | null }>
): boolean {
  if (rows.length === 0) return false;
  if (rows.length > 1) return true;
  const r = rows[0];
  return Boolean((r.color ?? "").trim() || (r.size ?? "").trim());
}

/** Pick the cart/order line variant row; validates stock caller-side. */
export function resolveSkuRowForCart<
  T extends { color: string | null; size: string | null; stock: number; price: unknown },
>(rows: T[], variantKey: string | null): T | null {
  if (!rows.length) return null;
  if (!skuVariantsRequireExplicitKey(rows)) return rows[0] ?? null;
  const mapped: SkuVariantLike[] = rows.map((r) => ({
    color: r.color,
    size: r.size,
    price: Number(r.price),
    stock: r.stock,
  }));
  const hit = findSkuVariantByKey(mapped, variantKey);
  if (!hit) return null;
  return rows.find(
    (r) =>
      (r.color?.trim() || "") === (hit.color?.trim() || "") &&
      (r.size?.trim() || "") === (hit.size?.trim() || "")
  ) ?? null;
}

export function normalizeVendorSkuVariants(
  rows:
    | Array<{
        color?: string | null;
        size?: string | null;
        price: number | string;
        stock: number | string;
        sku?: string | null;
        image?: string | null;
        images?: string[] | null;
      }>
    | undefined
): NormalizedVendorSkuVariant[] {
  if (!rows?.length) return [];
  return rows
    .map((r) => {
      const urls = normalizeVariantImageUrls(
        Array.isArray(r.images) ? r.images : null,
        r.image?.trim() || null
      );
      return {
        color: r.color?.trim() || null,
        size: r.size?.trim() || null,
        price: typeof r.price === "number" ? r.price : Number(r.price),
        stock: typeof r.stock === "number" ? r.stock : Number(r.stock),
        sku: r.sku?.trim() || null,
        image: urls[0] ?? null,
        images: urls,
      };
    })
    .filter((r) => {
      const hasDim = !!(r.color || r.size || r.sku || r.images.length > 0);
      if (rows.length === 1 && !hasDim) return true;
      return hasDim;
    });
}

/** Vendor form: one color (or blank) + shared images + N size lines → API variant rows. */
export type SkuVariantGroupFormRow = {
  color: string;
  images: string[];
  sizes: Array<{ size: string; price: string; stock: string; sku: string }>;
};

export function skuVariantsToFormGroups(
  rows: Array<{
    color: string | null;
    size: string | null;
    price: number;
    stock: number;
    sku: string | null;
    image: string | null;
    images?: string[] | null;
  }>
): SkuVariantGroupFormRow[] {
  if (!rows.length) return [];
  type R = (typeof rows)[number];
  const groups = new Map<string, R[]>();
  const order: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const c = (r.color ?? "").trim();
    const key = c || `__row_${i}`;
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(r);
  }
  return order.map((key) => {
    const list = groups.get(key)!;
    const first = list[0]!;
    const imgList = coalesceVariantImagesFromDb(first.images ?? null, first.image);
    return {
      color: (first.color ?? "").trim(),
      images: imgList,
      sizes: list.map((r) => ({
        size: r.size ?? "",
        price: String(r.price),
        stock: String(r.stock),
        sku: r.sku ?? "",
      })),
    };
  });
}

export const MAX_VARIANT_IMAGES = 10;

export function emptySkuVariantGroup(): SkuVariantGroupFormRow {
  return {
    color: "",
    images: [],
    sizes: [{ size: "", price: "", stock: "", sku: "" }],
  };
}
