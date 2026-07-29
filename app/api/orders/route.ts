import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  placeLegacyCartOrder,
  placeOrderFromCheckoutSession,
} from "@/lib/commerce/order-placement.service";

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

/**
 * POST /api/orders — place order from checkout session.
 * Body: {
 *   checkoutSessionId?: string,
 *   shippingAddressId: string,
 *   paymentMethod: "card" | "upi" | "cod",
 *   couponCode?: string,
 *   idempotencyKey?: string,
 *   confirmPriceChange?: boolean
 * }
 *
 * Backward compatible: if checkoutSessionId is omitted, creates a CART session from all cart items.
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

  const {
    checkoutSessionId,
    shippingAddressId,
    paymentMethod,
    couponCode,
    idempotencyKey,
    confirmPriceChange,
  } = body as {
    checkoutSessionId?: unknown;
    shippingAddressId?: unknown;
    paymentMethod?: unknown;
    couponCode?: unknown;
    idempotencyKey?: unknown;
    confirmPriceChange?: unknown;
  };

  if (typeof shippingAddressId !== "string" || !shippingAddressId.trim()) {
    return apiBadRequest("shippingAddressId is required.");
  }

  const idemKey =
    typeof idempotencyKey === "string" && idempotencyKey.trim()
      ? idempotencyKey.trim()
      : request.headers.get("Idempotency-Key")?.trim() || null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");

  let result;
  if (typeof checkoutSessionId === "string" && checkoutSessionId.trim()) {
    result = await placeOrderFromCheckoutSession({
      userId: user.id,
      checkoutSessionId: checkoutSessionId.trim(),
      shippingAddressId: shippingAddressId.trim(),
      paymentMethod: String(paymentMethod || "cod"),
      couponCode: typeof couponCode === "string" ? couponCode : null,
      idempotencyKey: idemKey,
      confirmPriceChange: confirmPriceChange === true,
    });
  } else {
    result = await placeLegacyCartOrder(
      user.id,
      shippingAddressId.trim(),
      String(paymentMethod || "cod"),
      typeof couponCode === "string" ? couponCode : null,
      idemKey
    );
  }

  return apiSuccess({
    orderId: result.orderId,
    totalAmount: result.totalAmount,
    message: result.message,
    requiresRazorpay: result.requiresRazorpay || false,
    recovered: result.recovered ?? false,
  });
});
