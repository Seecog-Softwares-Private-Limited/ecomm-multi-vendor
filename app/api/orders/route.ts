import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { listCustomerOrders, type OrderListSort } from "@/lib/data/customer-orders";
import {
  placeLegacyCartOrder,
  placeOrderFromCheckoutSession,
} from "@/lib/commerce/order-placement.service";
import { prisma } from "@/lib/prisma";
import { notifyOrderPlaced } from "@/lib/notifications/customer-notifications";

const VALID_SORTS: OrderListSort[] = ["newest", "oldest", "amount_asc", "amount_desc"];

/**
 * GET /api/orders — list orders for the logged-in customer.
 * Optional query: page, limit, status, search, sort (backward compatible when omitted).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to view orders.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can view their orders.");

  const { searchParams } = new URL(request.url);
  const pageRaw = searchParams.get("page");
  const limitRaw = searchParams.get("limit");
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? searchParams.get("q") ?? undefined;
  const sortRaw = searchParams.get("sort") ?? undefined;

  const sort =
    sortRaw && VALID_SORTS.includes(sortRaw as OrderListSort)
      ? (sortRaw as OrderListSort)
      : undefined;

  const result = await listCustomerOrders(session.sub, {
    page: pageRaw ? Number(pageRaw) : undefined,
    limit: limitRaw ? Number(limitRaw) : undefined,
    status,
    search,
    sort,
  });

  if (result.pagination) {
    return apiSuccess({ orders: result.orders, pagination: result.pagination });
  }

  return apiSuccess({ orders: result.orders });
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

  if (!result.recovered) {
    void notifyOrderPlaced(user.id, result.orderId).catch(() => undefined);
  }

  return apiSuccess({
    orderId: result.orderId,
    totalAmount: result.totalAmount,
    message: result.message,
    requiresRazorpay: result.requiresRazorpay || false,
    recovered: result.recovered ?? false,
  });
});
