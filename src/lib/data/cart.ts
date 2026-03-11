import { prisma } from "@/lib/prisma";

export type CartItemWithProduct = {
  id: string;
  productId: string;
  quantity: number;
  variantKey: string | null;
  product: {
    id: string;
    name: string;
    sellingPrice: number;
    mrp: number;
    stock: number;
    status: string;
    imageUrl: string | null;
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
          sellingPrice: true,
          mrp: true,
          stock: true,
          status: true,
          deletedAt: true,
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
      return {
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        variantKey: i.variantKey,
        product: {
          id: p.id,
          name: p.name,
          sellingPrice: Number(p.sellingPrice),
          mrp: Number(p.mrp),
          stock: p.stock,
          status: p.status,
          imageUrl: p.images[0]?.url ?? null,
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
  variantKey: string | null = null
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
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty, updatedAt: new Date() },
    });
    return { id: existing.id, quantity: newQty };
  }

  const created = await prisma.cartItem.create({
    data: {
      userId,
      productId,
      quantity: qty,
      variantKey: variantKey ?? null,
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
