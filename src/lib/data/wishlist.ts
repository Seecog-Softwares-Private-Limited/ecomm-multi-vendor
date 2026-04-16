import { prisma } from "@/lib/prisma";
import { resolveSkuRowForCart } from "@/lib/product-sku-variant";

export type WishlistItemWithProduct = {
  id: string;
  productId: string;
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
    avgRating: number | null;
    listingPaused?: boolean;
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
          slug: true,
          sellingPrice: true,
          mrp: true,
          stock: true,
          status: true,
          avgRating: true,
          deletedAt: true,
          productVariants: {
            where: { deletedAt: null },
            select: { color: true, size: true, price: true, stock: true },
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
    orderBy: { createdAt: "desc" },
  });

  return items
    .filter((i) => i.product != null && i.product.deletedAt == null)
    .map((i) => {
      const p = i.product!;
      const pv = p.productVariants ?? [];
      const line = pv.length > 0 ? resolveSkuRowForCart(pv, i.variantKey) : null;
      const liveSelling = line ? Number(line.price) : Number(p.sellingPrice);
      const liveMrp = Number(p.mrp);
      const snapS = i.listedSellingPrice != null ? Number(i.listedSellingPrice) : null;
      const snapM = i.listedMrp != null ? Number(i.listedMrp) : null;
      const listingPaused = p.status !== "ACTIVE";
      let sellingPrice: number;
      let mrp: number;
      if (snapS != null) {
        sellingPrice = snapS;
        mrp = snapM ?? snapS;
      } else if (listingPaused) {
        sellingPrice = 0;
        mrp = 0;
      } else {
        sellingPrice = liveSelling;
        mrp = liveMrp;
      }
      return {
        id: i.id,
        productId: i.productId,
        variantKey: i.variantKey,
        product: {
          id: p.id,
          name: p.name,
          slug: p.slug?.trim() ? p.slug : null,
          sellingPrice,
          mrp,
          stock: p.stock,
          status: p.status,
          avgRating: p.avgRating != null ? Number(p.avgRating) : null,
          imageUrl: p.images[0]?.url ?? null,
          ...(listingPaused ? { listingPaused: true } : {}),
        },
      };
    });
}

export async function addWishlistItem(
  userId: string,
  productId: string,
  variantKey: string | null = null,
  listed?: { selling: number; mrp: number } | null
): Promise<{ id: string }> {
  const existing = await prisma.wishlistItem.findFirst({
    where: {
      userId,
      productId,
      deletedAt: null,
    },
  });
  if (existing) {
    if (
      listed &&
      existing.listedSellingPrice == null &&
      existing.listedMrp == null
    ) {
      await prisma.wishlistItem.update({
        where: { id: existing.id },
        data: {
          listedSellingPrice: listed.selling,
          listedMrp: listed.mrp,
          updatedAt: new Date(),
        },
      });
    }
    return { id: existing.id };
  }

  const created = await prisma.wishlistItem.create({
    data: {
      userId,
      productId,
      variantKey: variantKey ?? null,
      ...(listed
        ? { listedSellingPrice: listed.selling, listedMrp: listed.mrp }
        : {}),
    },
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
