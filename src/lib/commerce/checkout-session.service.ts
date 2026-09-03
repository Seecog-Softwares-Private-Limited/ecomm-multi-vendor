import type { CheckoutSessionType } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { ApiRouteError } from "@/lib/api";
import { Status } from "@/lib/api/status";
import { prisma } from "@/lib/prisma";
import {
  resolveSkuRowForCart,
  skuVariantsRequireExplicitKey,
} from "@/lib/product-sku-variant";
import { resolveProductImageUrl } from "@/lib/product-image";
import { getCartVersion } from "./cart-version";
import { CHECKOUT_SESSION_TTL_MS, MAX_LINE_QUANTITY } from "./constants";
import { generateCommerceId } from "./id";
import { logCommerceEvent } from "./logger";
import {
  applyCouponToSubtotal,
  buildCheckoutTotals,
  computeLineSubtotal,
  type PricedCheckoutLine,
  type CheckoutTotals,
} from "./pricing";
import {
  reservationExpiresAt,
  reserveStockForSession,
  lockProductsForLines,
  type StockLineInput,
} from "./stock-reservation";
import { validateSellersForProducts } from "./vendor-validation";
import { invalidateCheckoutCache } from "./cache";
import { transitionCheckoutSession } from "./checkout-session-lifecycle";
import { runCommerceTransaction } from "./db-transaction";

export type BuyNowLineInput = {
  productId: string;
  variantKey?: string | null;
  quantity?: number;
};

export type CreateCheckoutSessionInput =
  | { type: "CART"; cartItemIds: string[] }
  | { type: "BUY_NOW"; lines: BuyNowLineInput[] }
  | { type: "REORDER"; lines: BuyNowLineInput[] };

type ResolvedLine = {
  cartItemId: string | null;
  productId: string;
  sellerId: string;
  variantKey: string | null;
  productVariantId: string | null;
  quantity: number;
  unitSellingPrice: number;
  unitMrp: number | null;
  gstPercent: number;
  productName: string;
  imageUrl: string;
};

const productSelect = {
  id: true,
  name: true,
  sellerId: true,
  sellingPrice: true,
  mrp: true,
  gstPercent: true,
  stock: true,
  status: true,
  deletedAt: true,
  productVariants: {
    where: { deletedAt: null },
    select: { id: true, color: true, size: true, price: true, stock: true, image: true, images: true },
  },
  images: {
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" as const },
    take: 1,
    select: { url: true },
  },
  seller: {
    select: { id: true, status: true, deletedAt: true, businessName: true },
  },
} satisfies Prisma.ProductSelect;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

function clampQty(q: number): number {
  return Math.max(1, Math.min(Math.round(q), MAX_LINE_QUANTITY));
}

function resolveUnitPrice(
  product: ProductRow,
  variantKey: string | null,
  listedSelling: number | null,
  listedMrp: number | null
): { unitSelling: number; unitMrp: number } {
  if (listedSelling != null) {
    return { unitSelling: listedSelling, unitMrp: listedMrp ?? listedSelling };
  }
  const pv = product.productVariants ?? [];
  if (pv.length > 0) {
    const row = resolveSkuRowForCart(pv, variantKey);
    if (row) {
      return { unitSelling: Number(row.price), unitMrp: Number(product.mrp) };
    }
  }
  return { unitSelling: Number(product.sellingPrice), unitMrp: Number(product.mrp) };
}

function resolveVariantId(product: ProductRow, variantKey: string | null): string | null {
  const pv = product.productVariants ?? [];
  if (pv.length === 0) return null;
  const row = resolveSkuRowForCart(pv, variantKey);
  return row?.id ?? null;
}

function assertProductAvailable(product: ProductRow): void {
  if (product.deletedAt != null || product.status !== "ACTIVE") {
    throw new ApiRouteError(
      `"${product.name}" is no longer available.`,
      Status.BAD_REQUEST,
      "PRODUCT_UNAVAILABLE"
    );
  }
}

async function resolveDirectLines(lines: BuyNowLineInput[]): Promise<ResolvedLine[]> {
  if (lines.length === 0) {
    throw new ApiRouteError("Select at least one item to checkout.", Status.BAD_REQUEST, "EMPTY_CHECKOUT");
  }

  const resolved: ResolvedLine[] = [];
  for (const line of lines) {
    const product = await prisma.product.findFirst({
      where: { id: line.productId, deletedAt: null },
      select: productSelect,
    });
    if (!product) {
      throw new ApiRouteError("Product not found or not available.", Status.BAD_REQUEST, "PRODUCT_NOT_FOUND");
    }
    assertProductAvailable(product);
    validateSellersForProducts([{ name: product.name, seller: product.seller }]);

    const vk =
      line.variantKey === null || line.variantKey === undefined
        ? null
        : String(line.variantKey).trim() || null;
    const pv = product.productVariants ?? [];
    if (pv.length > 0) {
      if (skuVariantsRequireExplicitKey(pv) && !vk) {
        throw new ApiRouteError(
          `Select a color or size for "${product.name}".`,
          Status.BAD_REQUEST,
          "VARIANT_REQUIRED"
        );
      }
      const skuRow = resolveSkuRowForCart(pv, vk);
      if (!skuRow) {
        throw new ApiRouteError("Invalid product option selected.", Status.BAD_REQUEST, "INVALID_VARIANT");
      }
      const qty = clampQty(line.quantity ?? 1);
      if (skuRow.stock < qty) {
        throw new ApiRouteError(
          `Not enough stock for "${product.name}".`,
          Status.BAD_REQUEST,
          "INSUFFICIENT_STOCK"
        );
      }
    } else {
      const qty = clampQty(line.quantity ?? 1);
      if (product.stock < qty) {
        throw new ApiRouteError(
          `Not enough stock for "${product.name}".`,
          Status.BAD_REQUEST,
          "INSUFFICIENT_STOCK"
        );
      }
    }

    const qty = clampQty(line.quantity ?? 1);
    const { unitSelling, unitMrp } = resolveUnitPrice(product, vk, null, null);
    const variantId = resolveVariantId(product, vk);

    resolved.push({
      cartItemId: null,
      productId: product.id,
      sellerId: String(product.sellerId).trim(),
      variantKey: vk,
      productVariantId: variantId,
      quantity: qty,
      unitSellingPrice: unitSelling,
      unitMrp: unitMrp,
      gstPercent:
        product.gstPercent !== null && product.gstPercent !== undefined
          ? Number(product.gstPercent)
          : 18,
      productName: product.name,
      imageUrl: resolveProductImageUrl(product.images[0]?.url),
    });
  }
  return resolved;
}

async function resolveCartLines(userId: string, cartItemIds: string[]): Promise<ResolvedLine[]> {
  if (cartItemIds.length === 0) {
    throw new ApiRouteError(
      "Select at least one item to proceed to checkout.",
      Status.BAD_REQUEST,
      "EMPTY_CART_SELECTION"
    );
  }

  const uniqueIds = [...new Set(cartItemIds.map((id) => id.trim()).filter(Boolean))];
  const cartItems = await prisma.cartItem.findMany({
    where: {
      id: { in: uniqueIds },
      userId,
      deletedAt: null,
      savedForLater: false,
    },
    include: {
      product: { select: productSelect },
    },
  });

  if (cartItems.length !== uniqueIds.length) {
    throw new ApiRouteError(
      "Some selected cart items are no longer available. Please refresh your cart.",
      Status.BAD_REQUEST,
      "CART_ITEMS_STALE"
    );
  }

  const resolved: ResolvedLine[] = [];
  for (const item of cartItems) {
    const product = item.product;
    assertProductAvailable(product);
    validateSellersForProducts([{ name: product.name, seller: product.seller }]);

    const { unitSelling, unitMrp } = resolveUnitPrice(
      product,
      item.variantKey,
      item.listedUnitSellingPrice != null ? Number(item.listedUnitSellingPrice) : null,
      item.listedUnitMrp != null ? Number(item.listedUnitMrp) : null
    );

    resolved.push({
      cartItemId: item.id,
      productId: product.id,
      sellerId: String(product.sellerId).trim(),
      variantKey: item.variantKey,
      productVariantId: resolveVariantId(product, item.variantKey),
      quantity: item.quantity,
      unitSellingPrice: unitSelling,
      unitMrp: unitMrp,
      gstPercent:
        product.gstPercent !== null && product.gstPercent !== undefined
          ? Number(product.gstPercent)
          : 18,
      productName: product.name,
      imageUrl: resolveProductImageUrl(product.images[0]?.url),
    });
  }
  return resolved;
}

async function expireStaleActiveSessions(userId: string): Promise<void> {
  const now = new Date();
  const stale = await prisma.checkoutSession.findMany({
    where: {
      userId,
      status: { in: ["ACTIVE", "CHECKING_OUT"] },
      expiresAt: { lte: now },
    },
    select: { id: true },
    take: 20,
  });

  if (stale.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const s of stale) {
      await transitionCheckoutSession(tx, s.id, "EXPIRED", "expired");
      invalidateCheckoutCache(s.id);
    }
  });
}

export async function createCheckoutSession(
  userId: string,
  input: CreateCheckoutSessionInput
): Promise<{ sessionId: string; expiresAt: string; cartVersion: number }> {
  await expireStaleActiveSessions(userId);

  const cartVersion = await getCartVersion(userId);
  const sessionType: CheckoutSessionType = input.type;

  const resolved =
    input.type === "CART"
      ? await resolveCartLines(userId, input.cartItemIds)
      : await resolveDirectLines(input.lines);

  const sessionId = generateCommerceId();
  const expiresAt = new Date(Date.now() + CHECKOUT_SESSION_TTL_MS);
  const stockExpires = reservationExpiresAt(expiresAt);

  const stockLines: StockLineInput[] = resolved.map((l) => ({
    productId: l.productId,
    productVariantId: l.productVariantId,
    variantKey: l.variantKey,
    quantity: l.quantity,
  }));

  await runCommerceTransaction(async (tx) => {
    // Lock inventory before superseding sessions that may release reservations.
    await lockProductsForLines(tx, stockLines);

    const activeSessions = await tx.checkoutSession.findMany({
      where: { userId, status: "ACTIVE" },
      select: { id: true },
    });
    for (const prev of activeSessions) {
      await transitionCheckoutSession(tx, prev.id, "EXPIRED", "superseded");
    }

    await tx.checkoutSession.create({
      data: {
        id: sessionId,
        userId,
        type: sessionType,
        status: "ACTIVE",
        cartVersion,
        expiresAt,
        lines: {
          create: resolved.map((l) => ({
            cartItemId: l.cartItemId,
            productId: l.productId,
            sellerId: l.sellerId,
            variantKey: l.variantKey,
            quantity: l.quantity,
            unitSellingPrice: l.unitSellingPrice,
            unitMrp: l.unitMrp,
          })),
        },
      },
    });

    await reserveStockForSession(tx, sessionId, stockLines, stockExpires);
  });

  logCommerceEvent("checkout_session_created", {
    checkoutSessionId: sessionId,
    userId,
    type: sessionType,
    lineCount: resolved.length,
  });

  return {
    sessionId,
    expiresAt: expiresAt.toISOString(),
    cartVersion,
  };
}

export type CheckoutSessionPayload = {
  session: {
    id: string;
    type: CheckoutSessionType;
    status: string;
    cartVersion: number;
    expiresAt: string;
    priceConfirmedAt: string | null;
    orderId: string | null;
  };
  items: Array<{
    id: string;
    cartItemId: string | null;
    productId: string;
    sellerId: string;
    productName: string;
    imageUrl: string;
    variantKey: string | null;
    quantity: number;
    unitSellingPrice: number;
    unitMrp: number | null;
    lineTotal: number;
  }>;
  totals: CheckoutTotals;
  /**
   * Present when the client sent `couponCode`. Soft preview never throws for
   * invalid coupons — use `valid` so UIs do not show "applied" incorrectly.
   */
  coupon: {
    code: string;
    valid: boolean;
    message: string | null;
    couponId: string | null;
  } | null;
  cartStale: boolean;
  requiresPriceConfirmation: boolean;
  priceChanges: Array<{
    productId: string;
    variantKey: string | null;
    productName: string;
    oldUnitPrice: number;
    newUnitPrice: number;
  }>;
};

export async function getCheckoutSessionForUser(
  sessionId: string,
  userId: string,
  couponCode?: string | null
): Promise<CheckoutSessionPayload> {
  const session = await prisma.checkoutSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      lines: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sellingPrice: true,
              mrp: true,
              gstPercent: true,
              productVariants: {
                where: { deletedAt: null },
                select: { color: true, size: true, price: true },
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
      },
      order: { select: { id: true } },
    },
  });

  if (!session) {
    throw new ApiRouteError("Checkout session not found.", Status.NOT_FOUND, "SESSION_NOT_FOUND");
  }

  const now = new Date();
  if (session.expiresAt <= now && session.status === "ACTIVE") {
    await prisma.$transaction(async (tx) => {
      await transitionCheckoutSession(tx, session.id, "EXPIRED", "expired");
    });
    throw new ApiRouteError(
      "Your checkout session has expired. Please start checkout again.",
      Status.BAD_REQUEST,
      "SESSION_EXPIRED"
    );
  }

  const currentCartVersion = await getCartVersion(userId);
  const cartStale =
    session.type === "CART" &&
    session.status === "ACTIVE" &&
    currentCartVersion !== session.cartVersion;

  const priceChanges: CheckoutSessionPayload["priceChanges"] = [];
  const pricedLines: PricedCheckoutLine[] = [];

  for (const line of session.lines) {
    const p = line.product;
    const listedSelling = Number(line.unitSellingPrice);
    let liveUnit = listedSelling;
    const pv = p.productVariants ?? [];
    if (pv.length > 0) {
      const row = resolveSkuRowForCart(pv, line.variantKey);
      if (row) liveUnit = Number(row.price);
    } else {
      liveUnit = Number(p.sellingPrice);
    }

    if (Math.abs(liveUnit - listedSelling) >= 0.01) {
      priceChanges.push({
        productId: line.productId,
        variantKey: line.variantKey,
        productName: p.name,
        oldUnitPrice: listedSelling,
        newUnitPrice: liveUnit,
      });
    }

    pricedLines.push({
      productId: line.productId,
      sellerId: line.sellerId,
      variantKey: line.variantKey,
      quantity: line.quantity,
      unitSellingPrice: listedSelling,
      unitMrp: line.unitMrp != null ? Number(line.unitMrp) : null,
      gstPercent:
        p.gstPercent !== null && p.gstPercent !== undefined ? Number(p.gstPercent) : 18,
      cartItemId: line.cartItemId,
    });
  }

  let discountAmount = 0;
  let couponId: string | null = null;
  let appliedCouponCode: string | null = null;
  let couponResult: CheckoutSessionPayload["coupon"] = null;

  const requestedCoupon = couponCode?.trim() || "";
  if (requestedCoupon) {
    try {
      const coupon = await applyCouponToSubtotal(requestedCoupon, computeLineSubtotal(pricedLines));
      discountAmount = coupon.discountAmount;
      couponId = coupon.couponId;
      appliedCouponCode = coupon.couponCode;
      couponResult = {
        code: coupon.couponCode ?? requestedCoupon,
        valid: true,
        message: null,
        couponId: coupon.couponId,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      const message =
        msg === "COUPON_EXhausted"
          ? "This coupon has reached its usage limit."
          : "Invalid or expired coupon code";
      couponResult = {
        code: requestedCoupon,
        valid: false,
        message,
        couponId: null,
      };
    }
  }

  const totals = buildCheckoutTotals(pricedLines, discountAmount, couponId, appliedCouponCode);
  const requiresPriceConfirmation =
    priceChanges.length > 0 && session.priceConfirmedAt == null;

  return {
    session: {
      id: session.id,
      type: session.type,
      status: session.status,
      cartVersion: session.cartVersion,
      expiresAt: session.expiresAt.toISOString(),
      priceConfirmedAt: session.priceConfirmedAt?.toISOString() ?? null,
      orderId: session.order?.id ?? null,
    },
    items: session.lines.map((line) => ({
      id: line.id,
      cartItemId: line.cartItemId,
      productId: line.productId,
      sellerId: line.sellerId,
      productName: line.product.name,
      imageUrl: resolveProductImageUrl(line.product.images[0]?.url),
      variantKey: line.variantKey,
      quantity: line.quantity,
      unitSellingPrice: Number(line.unitSellingPrice),
      unitMrp: line.unitMrp != null ? Number(line.unitMrp) : null,
      lineTotal: Number(line.unitSellingPrice) * line.quantity,
    })),
    totals,
    coupon: couponResult,
    cartStale,
    requiresPriceConfirmation,
    priceChanges,
  };
}

export async function confirmCheckoutSessionPrices(
  sessionId: string,
  userId: string
): Promise<void> {
  const session = await prisma.checkoutSession.findFirst({
    where: { id: sessionId, userId, status: "ACTIVE" },
    include: { lines: true },
  });
  if (!session) {
    throw new ApiRouteError("Checkout session not found.", Status.NOT_FOUND, "SESSION_NOT_FOUND");
  }

  await prisma.$transaction(async (tx) => {
    for (const line of session.lines) {
      const product = await tx.product.findFirst({
        where: { id: line.productId },
        select: {
          sellingPrice: true,
          mrp: true,
          productVariants: {
            where: { deletedAt: null },
            select: { color: true, size: true, price: true },
          },
        },
      });
      if (!product) continue;
      const pv = product.productVariants ?? [];
      let unitSelling = Number(product.sellingPrice);
      if (pv.length > 0) {
        const row = resolveSkuRowForCart(pv, line.variantKey);
        if (row) unitSelling = Number(row.price);
      }
      await tx.checkoutSessionLine.update({
        where: { id: line.id },
        data: {
          unitSellingPrice: unitSelling,
          unitMrp: Number(product.mrp),
        },
      });
    }
    await tx.checkoutSession.update({
      where: { id: sessionId },
      data: { priceConfirmedAt: new Date(), updatedAt: new Date() },
    });
  });

  invalidateCheckoutCache(sessionId);
}
