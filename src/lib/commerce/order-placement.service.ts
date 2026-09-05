import type { PaymentMode } from "@prisma/client";
import { ApiRouteError } from "@/lib/api";
import { Status } from "@/lib/api/status";
import { prisma } from "@/lib/prisma";
import { resolveSkuRowForCart } from "@/lib/product-sku-variant";
import { getCartVersion } from "./cart-version";
import { invalidateCartCache, invalidateCheckoutCache } from "./cache";
import { failCheckoutSessionWithRelease, transitionCheckoutSession } from "./checkout-session-lifecycle";
import {
  deriveLegacyCartIdempotencyKey,
  resolveOrderIdempotencyKey,
} from "./idempotency";
import { logCommerceEvent } from "./logger";
import {
  CUSTOMER_CANCELLABLE_ORDER_STATUSES,
} from "./order-state-machine";
import {
  applyCouponToSubtotal,
  buildCheckoutTotals,
  computeLineSubtotal,
  detectPriceChanges,
  formatPriceChangeMessage,
  type PricedCheckoutLine,
} from "./pricing";
import { consumeCouponUse } from "./coupon-usage";
import { consumeSessionReservations } from "./stock-reservation";
import { extendPaymentWindowForSession } from "./payment-window";
import { confirmRazorpayPayment } from "./payment-completion.service";
import { validateSellersForProducts } from "./vendor-validation";

export type PlaceOrderInput = {
  userId: string;
  checkoutSessionId: string;
  shippingAddressId: string;
  paymentMethod: string;
  couponCode?: string | null;
  idempotencyKey?: string | null;
  confirmPriceChange?: boolean;
};

export type PlaceOrderResult = {
  orderId: string;
  totalAmount: number;
  requiresRazorpay: boolean;
  message: string;
  recovered?: boolean;
};

function mapPaymentMode(payment: string): PaymentMode {
  const p = payment.toLowerCase();
  if (p === "card") return "CARD";
  if (p === "upi") return "UPI";
  return "COD";
}

function isOnlinePayment(mode: PaymentMode): boolean {
  return mode === "CARD" || mode === "UPI";
}

async function clearConsumedCartItems(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  userId: string,
  cartItemIds: string[]
): Promise<void> {
  if (cartItemIds.length === 0) return;
  const now = new Date();
  await tx.cartItem.updateMany({
    where: { id: { in: cartItemIds }, userId, deletedAt: null },
    data: { deletedAt: now, updatedAt: now },
  });
}

async function findExistingOrderForRequest(
  userId: string,
  checkoutSessionId: string,
  idempotencyKey: string
): Promise<{ orderId: string; totalAmount: number; requiresRazorpay: boolean } | null> {
  const byKey = await prisma.order.findFirst({
    where: { idempotencyKey, userId },
    select: {
      id: true,
      totalAmount: true,
      payments: { take: 1, select: { mode: true } },
    },
  });
  if (byKey) {
    const mode = byKey.payments[0]?.mode ?? "COD";
    return {
      orderId: byKey.id,
      totalAmount: Number(byKey.totalAmount),
      requiresRazorpay: isOnlinePayment(mode),
    };
  }

  const bySession = await prisma.order.findFirst({
    where: { checkoutSessionId, userId },
    select: {
      id: true,
      totalAmount: true,
      payments: { take: 1, select: { mode: true } },
    },
  });
  if (bySession) {
    const mode = bySession.payments[0]?.mode ?? "COD";
    return {
      orderId: bySession.id,
      totalAmount: Number(bySession.totalAmount),
      requiresRazorpay: isOnlinePayment(mode),
    };
  }

  return null;
}

export async function placeOrderFromCheckoutSession(
  input: PlaceOrderInput
): Promise<PlaceOrderResult> {
  const {
    userId,
    checkoutSessionId,
    shippingAddressId,
    paymentMethod,
    couponCode,
    idempotencyKey,
    confirmPriceChange,
  } = input;

  const idemKey = resolveOrderIdempotencyKey(checkoutSessionId, idempotencyKey);

  const existing = await findExistingOrderForRequest(userId, checkoutSessionId, idemKey);
  if (existing) {
    logCommerceEvent("order_created", { orderId: existing.orderId, userId, recovered: true });
    return {
      orderId: existing.orderId,
      totalAmount: existing.totalAmount,
      requiresRazorpay: existing.requiresRazorpay,
      message: "Order already placed.",
      recovered: true,
    };
  }

  const sessionRow = await prisma.checkoutSession.findFirst({
    where: { id: checkoutSessionId, userId },
    include: {
      order: { select: { id: true, totalAmount: true, payments: { take: 1 } } },
      lines: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              gstPercent: true,
              sellingPrice: true,
              productVariants: {
                where: { deletedAt: null },
                select: { color: true, size: true, price: true, stock: true },
              },
              seller: { select: { id: true, status: true, deletedAt: true, businessName: true } },
            },
          },
        },
      },
    },
  });

  if (!sessionRow) {
    throw new ApiRouteError("Checkout session not found.", Status.NOT_FOUND, "SESSION_NOT_FOUND");
  }

  if (sessionRow.order) {
    const mode = sessionRow.order.payments[0]?.mode ?? "COD";
    return {
      orderId: sessionRow.order.id,
      totalAmount: Number(sessionRow.order.totalAmount),
      requiresRazorpay: isOnlinePayment(mode),
      message: "Order already created for this checkout.",
      recovered: true,
    };
  }

  const now = new Date();
  if (sessionRow.expiresAt <= now && sessionRow.status === "ACTIVE") {
    await prisma.$transaction(async (tx) => {
      await transitionCheckoutSession(tx, checkoutSessionId, "EXPIRED", "expired");
    });
    throw new ApiRouteError(
      "Your checkout session has expired. Please start checkout again.",
      Status.BAD_REQUEST,
      "SESSION_EXPIRED"
    );
  }

  if (sessionRow.status === "COMPLETED") {
    throw new ApiRouteError("This checkout is already complete.", Status.CONFLICT, "SESSION_COMPLETED");
  }

  if (
    sessionRow.status === "EXPIRED" ||
    sessionRow.status === "FAILED" ||
    sessionRow.status === "CANCELLED"
  ) {
    throw new ApiRouteError(
      "This checkout session is no longer valid. Please start again.",
      Status.BAD_REQUEST,
      "SESSION_INVALID"
    );
  }

  if (sessionRow.status === "CHECKING_OUT") {
    const pending = await findExistingOrderForRequest(userId, checkoutSessionId, idemKey);
    if (pending) {
      return {
        orderId: pending.orderId,
        totalAmount: pending.totalAmount,
        requiresRazorpay: pending.requiresRazorpay,
        message: "Order already placed.",
        recovered: true,
      };
    }
    throw new ApiRouteError(
      "Checkout is already being processed. Please wait a moment.",
      Status.CONFLICT,
      "CHECKOUT_IN_PROGRESS"
    );
  }

  if (sessionRow.type === "CART") {
    const currentVersion = await getCartVersion(userId);
    if (currentVersion !== sessionRow.cartVersion) {
      logCommerceEvent("checkout_session_stale", {
        checkoutSessionId,
        userId,
        sessionVersion: sessionRow.cartVersion,
        currentVersion,
      });
      throw new ApiRouteError(
        "Your cart changed while you were checking out. Please refresh checkout and try again.",
        Status.CONFLICT,
        "CART_STALE"
      );
    }
  }

  const address = await prisma.address.findFirst({
    where: { id: shippingAddressId, userId, deletedAt: null },
  });
  if (!address) {
    throw new ApiRouteError("Invalid or missing shipping address.", Status.BAD_REQUEST, "INVALID_ADDRESS");
  }

  validateSellersForProducts(
    sessionRow.lines.map((l) => ({ name: l.product.name, seller: l.product.seller }))
  );

  const pricedLines: PricedCheckoutLine[] = sessionRow.lines.map((l) => ({
    productId: l.productId,
    sellerId: l.sellerId,
    variantKey: l.variantKey,
    quantity: l.quantity,
    unitSellingPrice: Number(l.unitSellingPrice),
    unitMrp: l.unitMrp != null ? Number(l.unitMrp) : null,
    gstPercent:
      l.product.gstPercent !== null && l.product.gstPercent !== undefined
        ? Number(l.product.gstPercent)
        : 18,
    cartItemId: l.cartItemId,
  }));

  const liveForPriceCheck = sessionRow.lines.map((l) => {
    const pv = l.product.productVariants ?? [];
    let liveUnit = Number(l.unitSellingPrice);
    if (pv.length > 0) {
      const row = resolveSkuRowForCart(pv, l.variantKey);
      if (row) liveUnit = Number(row.price);
    } else {
      liveUnit = Number(l.product.sellingPrice);
    }
    return {
      productId: l.productId,
      variantKey: l.variantKey,
      liveUnitPrice: liveUnit,
      productName: l.product.name,
    };
  });

  const priceChanges = detectPriceChanges(
    sessionRow.lines.map((l) => ({
      productId: l.productId,
      variantKey: l.variantKey,
      unitSellingPrice: Number(l.unitSellingPrice),
      productName: l.product.name,
    })),
    liveForPriceCheck
  );

  if (
    priceChanges.length > 0 &&
    !confirmPriceChange &&
    sessionRow.priceConfirmedAt == null
  ) {
    throw new ApiRouteError(formatPriceChangeMessage(priceChanges), Status.CONFLICT, "PRICE_CHANGED", {
      priceChanges,
    });
  }

  let discountAmount = 0;
  let couponId: string | null = null;
  try {
    const coupon = await applyCouponToSubtotal(couponCode ?? null, computeLineSubtotal(pricedLines), {
      userId,
    });
    discountAmount = coupon.discountAmount;
    couponId = coupon.couponId;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "COUPON_INVALID") {
      throw new ApiRouteError(
        "This coupon code is invalid or has expired.",
        Status.BAD_REQUEST,
        "COUPON_INVALID"
      );
    }
    if (msg === "COUPON_EXhausted") {
      throw new ApiRouteError(
        "This coupon has reached its usage limit.",
        Status.BAD_REQUEST,
        "COUPON_EXhausted"
      );
    }
    if (msg === "COUPON_USER_LIMIT") {
      throw new ApiRouteError(
        "You have already used this coupon the maximum number of times.",
        Status.BAD_REQUEST,
        "COUPON_USER_LIMIT"
      );
    }
    throw e;
  }

  const totals = buildCheckoutTotals(pricedLines, discountAmount, couponId, couponCode?.trim() ?? null);
  const paymentMode = mapPaymentMode(paymentMethod);
  const online = isOnlinePayment(paymentMode);
  const initialOrderStatus = online ? "PENDING_PAYMENT" : "PLACED";
  const consumedCartItemIds = sessionRow.lines
    .map((l) => l.cartItemId)
    .filter((id): id is string => id != null);

  let orderId: string;

  try {
    orderId = await prisma.$transaction(async (tx) => {
      const locked = await tx.checkoutSession.updateMany({
        where: { id: checkoutSessionId, userId, status: "ACTIVE" },
        data: { status: "CHECKING_OUT", updatedAt: now },
      });

      if (locked.count === 0) {
        throw new ApiRouteError(
          "Checkout is already being processed. Please wait a moment.",
          Status.CONFLICT,
          "CHECKOUT_IN_PROGRESS"
        );
      }

      const orderCreated = await tx.order.create({
        data: {
          userId,
          shippingAddressId: address.id,
          couponId,
          status: initialOrderStatus,
          totalAmount: totals.totalAmount,
          discountAmount: totals.discountAmount,
          taxAmount: totals.taxAmount,
          shippingAmount: totals.shippingAmount,
          checkoutSessionId,
          consumedCartItemIds: consumedCartItemIds.length > 0 ? consumedCartItemIds : undefined,
          idempotencyKey: idemKey,
        },
      });

      await tx.orderStatusEvent.create({
        data: {
          orderId: orderCreated.id,
          status: initialOrderStatus,
          note: online ? "Order awaiting payment" : "Order placed",
        },
      });

      for (const line of sessionRow.lines) {
        const unitPrice = Number(line.unitSellingPrice);
        await tx.orderItem.create({
          data: {
            orderId: orderCreated.id,
            productId: line.productId,
            sellerId: line.sellerId,
            quantity: line.quantity,
            unitPrice,
            totalPrice: unitPrice * line.quantity,
            status: "NEW",
            variantSnapshot: line.variantKey ? { raw: line.variantKey } : undefined,
            sku: line.product.sku,
          },
        });
      }

      await tx.payment.create({
        data: {
          orderId: orderCreated.id,
          mode: paymentMode,
          status: "PENDING",
          amount: totals.totalAmount,
          idempotencyKey: idemKey,
        },
      });

      if (online) {
        await extendPaymentWindowForSession(tx, checkoutSessionId);
      }

      if (!online) {
        await consumeSessionReservations(tx, checkoutSessionId);
        await clearConsumedCartItems(tx, userId, consumedCartItemIds);
        await transitionCheckoutSession(tx, checkoutSessionId, "COMPLETED", "completed");
        if (couponId) {
          try {
            await consumeCouponUse(tx, {
              couponId,
              userId,
              orderId: orderCreated.id,
            });
          } catch (e) {
            const msg = e instanceof Error ? e.message : "";
            if (msg === "COUPON_EXhausted") {
              throw new ApiRouteError(
                "This coupon has reached its usage limit.",
                Status.BAD_REQUEST,
                "COUPON_EXhausted"
              );
            }
            if (msg === "COUPON_USER_LIMIT") {
              throw new ApiRouteError(
                "You have already used this coupon the maximum number of times.",
                Status.BAD_REQUEST,
                "COUPON_USER_LIMIT"
              );
            }
            if (msg === "COUPON_INVALID") {
              throw new ApiRouteError(
                "This coupon code is invalid or has expired.",
                Status.BAD_REQUEST,
                "COUPON_INVALID"
              );
            }
            throw e;
          }
        }
      }

      await tx.checkoutSession.update({
        where: { id: checkoutSessionId },
        data: { idempotencyKey: idemKey, updatedAt: new Date() },
      });

      return orderCreated.id;
    });
  } catch (err) {
    const apiErr = err instanceof ApiRouteError ? err : null;
    const skipReleaseCodes = new Set([
      "CHECKOUT_IN_PROGRESS",
      "SESSION_COMPLETED",
      "SESSION_INVALID",
    ]);

    if (apiErr?.code === "CHECKOUT_IN_PROGRESS") {
      const existing = await findExistingOrderForRequest(userId, checkoutSessionId, idemKey);
      if (existing) {
        return {
          orderId: existing.orderId,
          totalAmount: existing.totalAmount,
          requiresRazorpay: existing.requiresRazorpay,
          message: "Order already placed.",
          recovered: true,
        };
      }
    }

    if (!apiErr || !skipReleaseCodes.has(apiErr.code)) {
      logCommerceEvent("order_failed", { checkoutSessionId, userId });
      await failCheckoutSessionWithRelease(checkoutSessionId);
    }
    throw err;
  }

  invalidateCartCache(userId);
  invalidateCheckoutCache(checkoutSessionId);
  logCommerceEvent("order_created", { orderId, userId, checkoutSessionId });

  const { getSmsNotificationService } = await import("@/services/sms-notification.service");
  getSmsNotificationService().onCustomerOrder({ orderId, amount: totals.totalAmount });

  return {
    orderId,
    totalAmount: totals.totalAmount,
    requiresRazorpay: online,
    message: "Order placed successfully",
  };
}

export async function placeLegacyCartOrder(
  userId: string,
  shippingAddressId: string,
  paymentMethod: string,
  couponCode?: string | null,
  idempotencyKey?: string | null
): Promise<PlaceOrderResult> {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId, deletedAt: null, savedForLater: false },
    select: { id: true },
  });
  if (cartItems.length === 0) {
    throw new ApiRouteError("Your cart is empty.", Status.BAD_REQUEST, "EMPTY_CART");
  }

  const cartItemIds = cartItems.map((c) => c.id);
  const legacyKey = idempotencyKey?.trim() || deriveLegacyCartIdempotencyKey(userId, cartItemIds);

  const existingByLegacyKey = await prisma.order.findFirst({
    where: { idempotencyKey: legacyKey, userId },
    select: { id: true, totalAmount: true, payments: { take: 1, select: { mode: true } } },
  });
  if (existingByLegacyKey) {
    const mode = existingByLegacyKey.payments[0]?.mode ?? "COD";
    return {
      orderId: existingByLegacyKey.id,
      totalAmount: Number(existingByLegacyKey.totalAmount),
      requiresRazorpay: isOnlinePayment(mode),
      message: "Order already placed.",
      recovered: true,
    };
  }

  const checkingOut = await prisma.checkoutSession.findFirst({
    where: { userId, status: "CHECKING_OUT" },
    include: { order: { select: { id: true, totalAmount: true, payments: { take: 1 } } } },
  });
  if (checkingOut?.order) {
    const mode = checkingOut.order.payments[0]?.mode ?? "COD";
    return {
      orderId: checkingOut.order.id,
      totalAmount: Number(checkingOut.order.totalAmount),
      requiresRazorpay: isOnlinePayment(mode),
      message: "Order already placed.",
      recovered: true,
    };
  }

  const { createCheckoutSession } = await import("./checkout-session.service");
  const { sessionId } = await createCheckoutSession(userId, { type: "CART", cartItemIds });
  const sessionKey = resolveOrderIdempotencyKey(sessionId, legacyKey);

  return placeOrderFromCheckoutSession({
    userId,
    checkoutSessionId: sessionId,
    shippingAddressId,
    paymentMethod,
    couponCode,
    idempotencyKey: sessionKey,
  });
}

export async function completeOrderAfterPayment(
  orderId: string,
  userId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  idempotencyKey?: string | null
): Promise<{ orderId: string; verified: boolean; recovered: boolean }> {
  return confirmRazorpayPayment({
    orderId,
    userId,
    razorpayPaymentId,
    razorpayOrderId,
    idempotencyKey,
    source: "verify",
  });
}

export async function cancelCheckoutSession(
  checkoutSessionId: string,
  userId: string
): Promise<void> {
  const session = await prisma.checkoutSession.findFirst({
    where: { id: checkoutSessionId, userId },
    select: { id: true, status: true, order: { select: { id: true } } },
  });
  if (!session) {
    throw new ApiRouteError("Checkout session not found.", Status.NOT_FOUND, "SESSION_NOT_FOUND");
  }
  if (session.order) {
    throw new ApiRouteError("Cannot cancel checkout after order is created.", Status.CONFLICT, "ORDER_EXISTS");
  }
  if (session.status === "COMPLETED" || session.status === "CANCELLED") return;

  await prisma.$transaction(async (tx) => {
    await transitionCheckoutSession(tx, checkoutSessionId, "CANCELLED", "cancelled");
  });
  invalidateCheckoutCache(checkoutSessionId);
}

export { CUSTOMER_CANCELLABLE_ORDER_STATUSES };
