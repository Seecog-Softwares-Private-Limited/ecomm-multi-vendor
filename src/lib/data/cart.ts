import { prisma } from "@/lib/prisma";

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
