import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { addToCart } from "@/lib/data/cart";
import { prisma } from "@/lib/prisma";
import { resolveSkuRowForCart, skuVariantsRequireExplicitKey } from "@/lib/product-sku-variant";
import { logCommerceEvent } from "@/lib/commerce/logger";

type GuestCartLine = {
  productId: string;
  quantity: number;
  variantKey?: string | null;
};

/**
 * POST /api/cart/merge — merge guest cart lines into the authenticated user's server cart.
 * Body: { items: [{ productId, quantity, variantKey? }] }
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to merge your cart.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers have a cart.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const itemsRaw =
    typeof body === "object" && body !== null && "items" in body
      ? (body as { items: unknown }).items
      : null;

  if (!Array.isArray(itemsRaw)) {
    return apiBadRequest("items must be an array.");
  }

  const items: GuestCartLine[] = itemsRaw
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    .map((row) => ({
      productId: typeof row.productId === "string" ? row.productId.trim() : "",
      quantity: typeof row.quantity === "number" ? Math.round(row.quantity) : 1,
      variantKey:
        row.variantKey === null || row.variantKey === undefined
          ? null
          : typeof row.variantKey === "string"
            ? row.variantKey.trim() || null
            : null,
    }))
    .filter((row) => row.productId.length > 0);

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");

  let merged = 0;
  const errors: string[] = [];

  for (const line of items) {
    const product = await prisma.product.findFirst({
      where: { id: line.productId, deletedAt: null, status: "ACTIVE" },
      select: {
        id: true,
        sellingPrice: true,
        mrp: true,
        stock: true,
        productVariants: {
          where: { deletedAt: null },
          select: { color: true, size: true, stock: true, price: true },
        },
      },
    });

    if (!product) {
      errors.push(`Product ${line.productId} is unavailable.`);
      continue;
    }

    const pv = product.productVariants ?? [];
    const vk = line.variantKey ?? null;
    if (pv.length > 0) {
      if (skuVariantsRequireExplicitKey(pv) && !vk) {
        errors.push(`Select options for product ${line.productId}.`);
        continue;
      }
      const skuRow = resolveSkuRowForCart(pv, vk);
      if (!skuRow) {
        errors.push(`Invalid options for product ${line.productId}.`);
        continue;
      }
      if (skuRow.stock < line.quantity) {
        errors.push(`Insufficient stock for product ${line.productId}.`);
        continue;
      }
    } else if (product.stock < line.quantity) {
      errors.push(`Insufficient stock for product ${line.productId}.`);
      continue;
    }

    let unitSelling = Number(product.sellingPrice);
    if (pv.length > 0) {
      const priceLine = resolveSkuRowForCart(pv, vk);
      if (priceLine) unitSelling = Number(priceLine.price);
    }

    await addToCart(user.id, line.productId, line.quantity, vk, {
      unitSelling,
      unitMrp: Number(product.mrp),
    });
    merged += 1;
  }

  logCommerceEvent("cart_merged", { userId: user.id, merged, skipped: errors.length });

  return apiSuccess({
    merged,
    skipped: errors.length,
    errors: errors.length > 0 ? errors : undefined,
    message:
      merged > 0
        ? `Merged ${merged} item${merged === 1 ? "" : "s"} into your cart.`
        : "No items could be merged.",
  });
});
