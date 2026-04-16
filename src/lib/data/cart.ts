import { prisma } from "@/lib/prisma";
import { coalesceVariantImagesFromDb, resolveSkuRowForCart } from "@/lib/product-sku-variant";

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
    imageUrl: string | null;
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
    where: { userId, deletedAt: null },
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
          imageUrl: variantThumb ?? p.images[0]?.url ?? null,
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
      deletedAt: null,
    },
  });

  if (existing) {
    const newQty = Math.min(99, existing.quantity + qty);
    const snapshotPatch =
      listed &&
      existing.listedUnitSellingPrice == null &&
      existing.listedUnitMrp == null
        ? {
            listedUnitSellingPrice: listed.unitSelling,
            listedUnitMrp: listed.unitMrp,
          }
        : {};
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty, updatedAt: new Date(), ...snapshotPatch },
    });
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
  return { id: created.id, quantity: created.quantity };
}

/**
 * Update cart item quantity. Returns updated quantity or null if not found.
 */
export async function updateCartItemQuantity(
  userId: string,
  cartItemId: string,
  quantity: number
): Promise<number | null> {
  const qty = Math.max(1, Math.min(quantity, 99));
  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId, deletedAt: null },
  });
  if (!item) return null;
  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: qty, updatedAt: new Date() },
  });
  return qty;
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
  return true;
}
