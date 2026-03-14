import { prisma } from "@/lib/prisma";

export type WishlistItemWithProduct = {
  id: string;
  productId: string;
  variantKey: string | null;
  product: {
    id: string;
    name: string;
    sellingPrice: number;
    mrp: number;
    stock: number;
    status: string;
    imageUrl: string | null;
    avgRating: number | null;
  };
};

export async function getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]> {
  const items = await prisma.wishlistItem.findMany({
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
          avgRating: true,
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
    orderBy: { createdAt: "desc" },
  });

  return items
    .filter((i) => i.product != null && i.product.deletedAt == null)
    .map((i) => {
      const p = i.product!;
      return {
        id: i.id,
        productId: i.productId,
        variantKey: i.variantKey,
        product: {
          id: p.id,
          name: p.name,
          sellingPrice: Number(p.sellingPrice),
          mrp: Number(p.mrp),
          stock: p.stock,
          status: p.status,
          avgRating: p.avgRating != null ? Number(p.avgRating) : null,
          imageUrl: p.images[0]?.url ?? null,
        },
      };
    });
}

export async function addWishlistItem(
  userId: string,
  productId: string,
  variantKey: string | null = null
): Promise<{ id: string }> {
  const existing = await prisma.wishlistItem.findFirst({
    where: {
      userId,
      productId,
      deletedAt: null,
    },
  });
  if (existing) return { id: existing.id };

  const created = await prisma.wishlistItem.create({
    data: { userId, productId, variantKey: variantKey ?? null },
    select: { id: true },
  });
  return { id: created.id };
}

export async function removeWishlistItem(userId: string, wishlistItemId: string): Promise<boolean> {
  const item = await prisma.wishlistItem.findFirst({
    where: { id: wishlistItemId, userId, deletedAt: null },
  });
  if (!item) return false;
  await prisma.wishlistItem.update({
    where: { id: wishlistItemId },
    data: { deletedAt: new Date(), updatedAt: new Date() },
  });
  return true;
}

export async function clearWishlist(userId: string): Promise<number> {
  const result = await prisma.wishlistItem.updateMany({
    where: { userId, deletedAt: null },
    data: { deletedAt: new Date(), updatedAt: new Date() },
  });
  return result.count;
}
