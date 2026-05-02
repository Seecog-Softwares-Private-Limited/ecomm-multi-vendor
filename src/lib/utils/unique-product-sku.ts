import { randomBytes } from "crypto";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";

/**
 * Generates a unique SKU for a seller (@@unique([sellerId, sku])).
 * Used when the vendor leaves the base SKU field empty.
 */
export async function generateUniqueProductSku(sellerId: string, productName: string): Promise<string> {
  const raw = slugify(productName, { lower: true, strict: true, trim: true }).replace(/-/g, "");
  const base = (raw || "ITEM").toUpperCase().slice(0, 40);

  const isFree = async (candidate: string) => {
    const row = await prisma.product.findFirst({
      where: { sellerId, sku: candidate },
      select: { id: true },
    });
    return !row;
  };

  if (await isFree(base)) return base;

  let n = 1;
  while (n < 10_000) {
    const candidate = `${base}-${n}`.slice(0, 100);
    if (await isFree(candidate)) return candidate;
    n++;
  }

  for (let i = 0; i < 12; i++) {
    const candidate = `AUTO-${randomBytes(5).toString("hex").toUpperCase()}`.slice(0, 100);
    if (await isFree(candidate)) return candidate;
  }

  throw new Error("Could not generate a unique SKU");
}
