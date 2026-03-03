import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiBadRequest } from "@/lib/api";
import { requireVendorApproved } from "@/lib/auth";
import {
  getVendorOrdersBySellerId,
  createVendorOrder,
  type CreateVendorOrderInput,
} from "@/lib/data/vendor-orders";

/**
 * GET /api/vendor/orders — list orders for the logged-in vendor. Requires approved status.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { sellerId } = await requireVendorApproved(request);

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const orders = await getVendorOrdersBySellerId(sellerId, dateFrom, dateTo);
  return apiSuccess(orders);
});

/**
 * POST /api/vendor/orders — create a test order (vendor creates order for a customer).
 * Body: { customerUserId, shippingAddressId, items: [ { productId, quantity } ] }.
 * All products must belong to the logged-in vendor and be ACTIVE.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const { sellerId } = await requireVendorApproved(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const raw = body as Record<string, unknown>;
  const customerUserId = typeof raw.customerUserId === "string" ? raw.customerUserId : undefined;
  const shippingAddressId = typeof raw.shippingAddressId === "string" ? raw.shippingAddressId : undefined;
  const itemsRaw = Array.isArray(raw.items) ? raw.items : undefined;

  if (!customerUserId || !shippingAddressId || !itemsRaw?.length) {
    return apiBadRequest(
      "Body must include customerUserId (string), shippingAddressId (string), and items (array of { productId, quantity })"
    );
  }

  const items: { productId: string; quantity: number }[] = [];
  for (const entry of itemsRaw) {
    const o = entry as Record<string, unknown>;
    const productId = typeof o.productId === "string" ? o.productId : "";
    const quantity = typeof o.quantity === "number" ? o.quantity : Number(o.quantity) || 0;
    if (!productId || quantity < 1) continue;
    items.push({ productId, quantity });
  }
  if (items.length === 0) {
    return apiBadRequest("items must have at least one entry with productId and quantity >= 1");
  }

  const input: CreateVendorOrderInput = {
    customerUserId,
    shippingAddressId,
    items,
  };

  try {
    const result = await createVendorOrder(sellerId, input);
    return apiSuccess(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return apiBadRequest(message);
  }
});
