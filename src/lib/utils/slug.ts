import slugify from "slugify";
import { prisma } from "@/lib/prisma";

/**
 * Generates a URL-safe, lowercase, hyphen-separated slug from a product name.
 * Ensures uniqueness by appending -1, -2, ... if a conflict is found.
 *
 * @param name       - Product name to slugify
 * @param excludeId  - Product ID to exclude from uniqueness check (for updates)
 * @returns          - A unique slug string
 */
export async function generateUniqueSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  const buildWhere = (slug: string) =>
    excludeId
      ? { slug, id: { not: excludeId } }
      : { slug };

  const existing = await prisma.product.findFirst({
    where: buildWhere(base),
    select: { id: true },
  });

  if (!existing) return base;

  let counter = 1;
  while (true) {
    const candidate = `${base}-${counter}`;
    const conflict = await prisma.product.findFirst({
      where: buildWhere(candidate),
      select: { id: true },
    });
    if (!conflict) return candidate;
    counter++;
  }
}
