import { prisma } from "@/lib/prisma";
import { resolveProductImageUrl } from "@/lib/product-image";
import { coalesceVariantImagesFromDb, resolveSkuRowForCart } from "@/lib/product-sku-variant";
import { incrementCartVersion } from "@/lib/commerce/cart-version";
import { invalidateCartCache } from "@/lib/commerce/cache";

export type CartItemWithProduct = {
  id: string;
  productId: string;
  quantity: number;
  variantKey: string | null;
  product: {
    id: string;
    name: string;
    slug: string | null;
    sellingPrice: number;
    mrp: number;
    stock: number;
    status: string;
    /** Resolved display URL (never empty). */
    imageUrl: string;
    gstPercent: number | null;
    /** True when the listing is not ACTIVE (e.g. pending admin re-approval); prices come from snapshot when available. */
    listingPaused?: boolean;
  };
};

/**
 * Get all cart items for a user with product details.
 */
export async function getCartItems(userId: string): Promise<CartItemWithProduct[]> {
  const items = await prisma.cartItem.findMany({
    where: { userId, deletedAt: null, savedForLater: false },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          sellingPrice: true,
          mrp: true,
          gstPercent: true,
          stock: true,
          status: true,
          deletedAt: true,
          productVariants: {
            where: { deletedAt: null },
            select: { color: true, size: true, price: true, stock: true, image: true, images: true },
          },
          images: {
            where: { deletedAt: null },
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: { url: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return items
    .filter((i) => i.product != null && i.product.deletedAt == null)
    .map((i) => {
      const p = i.product!;
      const pv = p.productVariants ?? [];
      const line = pv.length > 0 ? resolveSkuRowForCart(pv, i.variantKey) : null;
      const liveSelling = line ? Number(line.price) : Number(p.sellingPrice);
      const liveMrp = Number(p.mrp);
      const snapshotSelling =
        i.listedUnitSellingPrice != null ? Number(i.listedUnitSellingPrice) : null;
      const snapshotMrp = i.listedUnitMrp != null ? Number(i.listedUnitMrp) : null;
      const listingPaused = p.status !== "ACTIVE";
      let sellingPrice: number;
      let mrp: number;
      if (snapshotSelling != null) {
        sellingPrice = snapshotSelling;
        mrp = snapshotMrp ?? snapshotSelling;
      } else if (listingPaused) {
        sellingPrice = 0;
        mrp = 0;
      } else {
        sellingPrice = liveSelling;
        mrp = liveMrp;
      }
      const stockDisplay = line ? line.stock : p.stock;
      const variantThumb = line
        ? coalesceVariantImagesFromDb(
            (line as { images?: unknown }).images,
            (line as { image?: string | null }).image
          )[0] ?? null
        : null;
      return {
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        variantKey: i.variantKey,
        product: {
          id: p.id,
          name: p.name,
          slug: p.slug?.trim() ? p.slug : null,
          sellingPrice,
          mrp,
          gstPercent: p.gstPercent !== null && p.gstPercent !== undefined ? Number(p.gstPercent) : null,
          stock: stockDisplay,
          status: p.status,
          imageUrl: resolveProductImageUrl(variantThumb ?? p.images[0]?.url),
          ...(listingPaused ? { listingPaused: true } : {}),
        },
      };
    });
}

/**
 * Add a product to the user's cart. If the same product + variantKey already exists,
 * quantity is increased; otherwise a new cart item is created.
 */
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number,
  variantKey: string | null = null,
  listed?: { unitSelling: number; unitMrp: number } | null
): Promise<{ id: string; quantity: number }> {
  const qty = Math.max(1, Math.min(quantity, 99));

  const existing = await prisma.cartItem.findFirst({
    where: {
      userId,
      productId,
      variantKey: variantKey ?? null,
    },
  });

  if (existing) {
    const snapshotPatch =
      listed &&
      existing.listedUnitSellingPrice == null &&
      existing.listedUnitMrp == null
        ? {
            listedUnitSellingPrice: listed.unitSelling,
            listedUnitMrp: listed.unitMrp,
          }
        : {};

    if (existing.deletedAt != null) {
      const restoredQty = Math.min(99, qty);
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: restoredQty,
          deletedAt: null,
          savedForLater: false,
          updatedAt: new Date(),
          ...snapshotPatch,
        },
      });
      await incrementCartVersion(userId);
      invalidateCartCache(userId);
      return { id: existing.id, quantity: restoredQty };
    }

    const newQty = Math.min(99, existing.quantity + qty);
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty, updatedAt: new Date(), ...snapshotPatch },
    });
    await incrementCartVersion(userId);
    invalidateCartCache(userId);
    return { id: existing.id, quantity: newQty };
  }

  const created = await prisma.cartItem.create({
    data: {
      userId,
      productId,
      quantity: qty,
      variantKey: variantKey ?? null,
      ...(listed
        ? {
            listedUnitSellingPrice: listed.unitSelling,
            listedUnitMrp: listed.unitMrp,
          }
        : {}),
    },
  });
  await incrementCartVersion(userId);
  invalidateCartCache(userId);
  return { id: created.id, quantity: created.quantity };
}

export type UpdateCartItemQuantityResult =
  | { ok: true; quantity: number }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "insufficient_stock"; available: number };

/**
 * Update cart item quantity. Validates live stock (product or SKU row).
 */
export async function updateCartItemQuantity(
  userId: string,
  cartItemId: string,
  quantity: number
): Promise<UpdateCartItemQuantityResult> {
  const qty = Math.max(1, Math.min(quantity, 99));
  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId, deletedAt: null },
    include: {
      product: {
        select: {
          stock: true,
          deletedAt: true,
          productVariants: {
            where: { deletedAt: null },
            select: { color: true, size: true, stock: true, price: true },
          },
        },
      },
    },
  });
  if (!item || item.product.deletedAt != null) {
    return { ok: false, reason: "not_found" };
  }

  const pv = item.product.productVariants ?? [];
  let available: number;
  if (pv.length > 0) {
    const line = resolveSkuRowForCart(pv, item.variantKey);
    if (!line) {
      return { ok: false, reason: "not_found" };
    }
    available = line.stock;
  } else {
    available = item.product.stock;
  }

  if (qty > available) {
    return { ok: false, reason: "insufficient_stock", available };
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: qty, updatedAt: new Date() },
  });
  await incrementCartVersion(userId);
  invalidateCartCache(userId);
  return { ok: true, quantity: qty };
}

/**
 * Remove (soft-delete) a cart item. Returns true if found and removed.
 */
export async function removeCartItem(userId: string, cartItemId: string): Promise<boolean> {
  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId, deletedAt: null },
  });
  if (!item) return false;
  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { deletedAt: new Date(), updatedAt: new Date() },
  });
  await incrementCartVersion(userId);
  invalidateCartCache(userId);
  return true;
}

/**
 * Get saved-for-later items (same shape as cart items).
 */
export async function getSavedForLaterItems(userId: string): Promise<CartItemWithProduct[]> {
  const items = await prisma.cartItem.findMany({
    where: { userId, deletedAt: null, savedForLater: true },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          sellingPrice: true,
          mrp: true,
          gstPercent: true,
          stock: true,
          status: true,
          deletedAt: true,
          productVariants: {
            where: { deletedAt: null },
            select: { color: true, size: true, price: true, stock: true, image: true, images: true },
          },
          images: {
            where: { deletedAt: null },
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: { url: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return items
    .filter((i) => i.product != null && i.product.deletedAt == null)
    .map((i) => {
      const p = i.product!;
      const pv = p.productVariants ?? [];
      const line = pv.length > 0 ? resolveSkuRowForCart(pv, i.variantKey) : null;
      const snapshotSelling =
        i.listedUnitSellingPrice != null ? Number(i.listedUnitSellingPrice) : null;
      const snapshotMrp = i.listedUnitMrp != null ? Number(i.listedUnitMrp) : null;
      const listingPaused = p.status !== "ACTIVE";
      let sellingPrice: number;
      let mrp: number;
      if (snapshotSelling != null) {
        sellingPrice = snapshotSelling;
        mrp = snapshotMrp ?? snapshotSelling;
      } else if (listingPaused) {
        sellingPrice = 0;
        mrp = 0;
      } else {
        sellingPrice = line ? Number(line.price) : Number(p.sellingPrice);
        mrp = Number(p.mrp);
      }
      const stockDisplay = line ? line.stock : p.stock;
      const variantThumb = line
        ? coalesceVariantImagesFromDb(
            (line as { images?: unknown }).images,
            (line as { image?: string | null }).image
          )[0] ?? null
        : null;
      return {
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        variantKey: i.variantKey,
        product: {
          id: p.id,
          name: p.name,
          slug: p.slug?.trim() ? p.slug : null,
          sellingPrice,
          mrp,
          gstPercent:
            p.gstPercent !== null && p.gstPercent !== undefined ? Number(p.gstPercent) : null,
          stock: stockDisplay,
          status: p.status,
          imageUrl: resolveProductImageUrl(variantThumb ?? p.images[0]?.url),
          ...(listingPaused ? { listingPaused: true } : {}),
        },
      };
    });
}

export async function setCartItemSavedForLater(
  userId: string,
  cartItemId: string,
  saved: boolean
): Promise<boolean> {
  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId, deletedAt: null },
  });
  if (!item) return false;
  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { savedForLater: saved, updatedAt: new Date() },
  });
  await incrementCartVersion(userId);
  invalidateCartCache(userId);
  return true;
}
