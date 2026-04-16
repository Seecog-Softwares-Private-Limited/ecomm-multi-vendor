import { NextRequest } from "next/server";
import { PaymentMode } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveSkuRowForCart } from "@/lib/product-sku-variant";
import { DEFAULT_GST_PERCENT } from "@/lib/constants/gst";

/**
 * GET /api/orders — list orders for the logged-in customer.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to view orders.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can view their orders.");

  const orders = await prisma.order.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  });

  const list = orders.map((o) => ({
    id: o.id,
    status: o.status,
    totalAmount: Number(o.totalAmount),
    createdAt: o.createdAt.toISOString(),
    itemCount: o._count.items,
  }));

  return apiSuccess({ orders: list });
});

const SHIPPING_FREE_THRESHOLD = 500;
const SHIPPING_COST = 50;

/**
 * POST /api/orders — place order from cart (checkout).
 * Body: { shippingAddressId: string, paymentMethod: "card" | "upi" | "cod", couponCode?: string }
 * Requires customer session.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to place an order.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can place orders.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) return apiBadRequest("Body must be an object.");

  const { shippingAddressId, paymentMethod, couponCode } = body as {
    shippingAddressId?: unknown;
    paymentMethod?: unknown;
    couponCode?: unknown;
  };

  if (typeof shippingAddressId !== "string" || !shippingAddressId.trim()) {
    return apiBadRequest("shippingAddressId is required.");
  }
  const payment = String(paymentMethod || "cod").toLowerCase();
  const validPayment: PaymentMode[] = ["CARD", "UPI", "COD", "WALLET", "PREPAID", "OTHER"];
  const paymentMode: PaymentMode =
    payment === "card" ? "CARD" : payment === "upi" ? "UPI" : payment === "cod" ? "COD" : "COD";

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");

  const address = await prisma.address.findFirst({
    where: { id: shippingAddressId, userId: user.id, deletedAt: null },
  });
  if (!address) return apiBadRequest("Invalid or missing shipping address.");

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id, deletedAt: null },
    include: {
      product: {
        select: {
          id: true,
          sellerId: true,
          sku: true,
          sellingPrice: true,
          mrp: true,
          gstPercent: true,
          status: true,
          deletedAt: true,
          stock: true,
          productVariants: {
            where: { deletedAt: null },
            select: { color: true, size: true, price: true, stock: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const validItems = cartItems.filter(
    (i) => i.product && i.product.deletedAt == null && i.product.status === "ACTIVE"
  );
  if (validItems.length === 0) {
    if (cartItems.length === 0) {
      return apiBadRequest("Your cart is empty. Please add items before placing an order.");
    }
    return apiBadRequest(
      "Some items in your cart are unavailable (inactive or removed). Please update your cart."
    );
  }

  let couponId: string | null = null;
  let discountAmount = 0;

  function unitPriceForCartLine(lineItem: (typeof validItems)[number]): number {
    if (lineItem.listedUnitSellingPrice != null) {
      return Number(lineItem.listedUnitSellingPrice);
    }
    const p = lineItem.product!;
    const pv = p.productVariants ?? [];
    if (pv.length > 0) {
      const row = resolveSkuRowForCart(pv, lineItem.variantKey);
      return row ? Number(row.price) : Number(p.sellingPrice);
    }
    return Number(p.sellingPrice);
  }

  const subtotal = validItems.reduce((sum, i) => sum + unitPriceForCartLine(i) * i.quantity, 0);

  if (typeof couponCode === "string" && couponCode.trim()) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode.trim(),
        deletedAt: null,
        validFrom: { lte: new Date() },
        validTo: { gte: new Date() },
      },
    });
    if (coupon) {
      couponId = coupon.id;
      const val = Number(coupon.discountValue);
      discountAmount =
        coupon.discountType === "PERCENT" ? (subtotal * val) / 100 : Math.min(val, subtotal);
    }
  }

  const amountAfterDiscount = Math.max(0, subtotal - discountAmount);
  const shippingAmount = amountAfterDiscount >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST;
  const taxAmount = validItems.reduce((sum, i) => {
    const unitPrice = unitPriceForCartLine(i);
    const gst =
      i.product?.gstPercent !== null && i.product?.gstPercent !== undefined
        ? Number(i.product.gstPercent)
        : DEFAULT_GST_PERCENT;
    return sum + unitPrice * i.quantity * (gst / 100);
  }, 0);
  const totalAmount = amountAfterDiscount + shippingAmount + taxAmount;

  const order = await prisma.$transaction(async (tx) => {
    const orderCreated = await tx.order.create({
      data: {
        userId: user.id,
        shippingAddressId: address.id,
        couponId,
        status: "PLACED",
        totalAmount,
        discountAmount,
        taxAmount,
        shippingAmount,
      },
    });

    await tx.orderStatusEvent.create({
      data: { orderId: orderCreated.id, status: "PLACED", note: "Order placed" },
    });

    for (const it of validItems) {
      const p = it.product!;
      const unitPrice = unitPriceForCartLine(it);
      const totalPrice = unitPrice * it.quantity;
      await tx.orderItem.create({
        data: {
          orderId: orderCreated.id,
          productId: p.id,
          sellerId: p.sellerId,
          quantity: it.quantity,
          unitPrice,
          totalPrice,
          status: "NEW",
          variantSnapshot: it.variantKey ? { raw: it.variantKey } : undefined,
          sku: p.sku,
        },
      });
    }

    await tx.payment.create({
      data: {
        orderId: orderCreated.id,
        mode: paymentMode,
        status: paymentMode === "COD" ? "PENDING" : "PENDING",
        amount: totalAmount,
      },
    });

    // Clear cart only for COD. For Card/UPI we clear cart after payment is verified (in /api/payments/verify)
    // so that if the user cancels Razorpay they can retry without losing their cart.
    if (paymentMode === "COD") {
      for (const it of validItems) {
        await tx.cartItem.update({
          where: { id: it.id },
          data: { deletedAt: new Date(), updatedAt: new Date() },
        });
      }
    }

    return orderCreated;
  });

  const requiresRazorpay = paymentMode === "CARD" || paymentMode === "UPI";

  return apiSuccess({
    orderId: order.id,
    totalAmount: Number(order.totalAmount),
    message: "Order placed successfully",
    requiresRazorpay: requiresRazorpay || false,
  });
});
