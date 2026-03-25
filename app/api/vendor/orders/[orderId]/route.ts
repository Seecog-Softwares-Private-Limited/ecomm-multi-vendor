import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
  apiBadRequest,
} from "@/lib/api";
import { requireVendorApproved } from "@/lib/auth";
import {
  getVendorOrderDetailForSeller,
  vendorAcceptOrder,
  vendorRejectOrder,
  vendorShipOrder,
  vendorDeliverOrder,
} from "@/lib/data/vendor-orders";

type RouteContext = { params: Promise<Record<string, string | string[]>> };

async function orderIdFromContext(context?: RouteContext): Promise<string> {
  const params = context ? await context.params : {};
  const raw = params?.orderId;
  const orderId = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  return orderId?.trim() ?? "";
}

function mapActionFailure(error: string) {
  switch (error) {
    case "NOT_FOUND":
      return apiNotFound("Order not found.");
    case "INVALID_STATE":
      return apiBadRequest("This action is not allowed for the current order state.");
    case "NOTHING_TO_SHIP":
      return apiBadRequest("No accepted items to ship.");
    case "NOTHING_TO_DELIVER":
      return apiBadRequest("No shipped items to mark as delivered.");
    case "REASON_REQUIRED":
      return apiBadRequest("Rejection reason is required.");
    case "COURIER_REQUIRED":
      return apiBadRequest("Courier name is required.");
    default:
      return apiBadRequest("Could not update the order. Try again.");
  }
}

/**
 * GET /api/vendor/orders/[orderId] — order detail for the logged-in vendor (their line items only).
 */
export const GET = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const { sellerId } = await requireVendorApproved(request);
  const orderId = await orderIdFromContext(context);
  if (!orderId) {
    return apiNotFound("Order not found.");
  }

  const detail = await getVendorOrderDetailForSeller(sellerId, orderId);
  if (!detail) {
    return apiNotFound("Order not found.");
  }

  return apiSuccess(detail);
});

/**
 * PATCH /api/vendor/orders/[orderId] — accept, reject, ship, or deliver (this vendor's line items).
 * Body: { action: "accept" } | { action: "reject", reason } | { action: "ship", courierName, trackingLink? } | { action: "deliver" }
 */
export const PATCH = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const { sellerId } = await requireVendorApproved(request);
  const orderId = await orderIdFromContext(context);
  if (!orderId) {
    return apiNotFound("Order not found.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  if (typeof body !== "object" || body === null) {
    return apiBadRequest("Body must be an object");
  }

  const action = (body as { action?: unknown }).action;
  if (action === "accept") {
    const r = await vendorAcceptOrder(sellerId, orderId);
    if (!r.ok) return mapActionFailure(r.error);
    const detail = await getVendorOrderDetailForSeller(sellerId, orderId);
    return apiSuccess(detail ?? { updated: true });
  }

  if (action === "reject") {
    const reason = (body as { reason?: unknown }).reason;
    const r = await vendorRejectOrder(
      sellerId,
      orderId,
      typeof reason === "string" ? reason : ""
    );
    if (!r.ok) return mapActionFailure(r.error);
    const detail = await getVendorOrderDetailForSeller(sellerId, orderId);
    return apiSuccess(detail ?? { updated: true });
  }

  if (action === "ship") {
    const courierName = (body as { courierName?: unknown }).courierName;
    const trackingLink = (body as { trackingLink?: unknown }).trackingLink;
    const r = await vendorShipOrder(
      sellerId,
      orderId,
      typeof courierName === "string" ? courierName : "",
      typeof trackingLink === "string" ? trackingLink : undefined
    );
    if (!r.ok) return mapActionFailure(r.error);
    const detail = await getVendorOrderDetailForSeller(sellerId, orderId);
    return apiSuccess(detail ?? { updated: true });
  }

  if (action === "deliver") {
    const r = await vendorDeliverOrder(sellerId, orderId);
    if (!r.ok) return mapActionFailure(r.error);
    const detail = await getVendorOrderDetailForSeller(sellerId, orderId);
    return apiSuccess(detail ?? { updated: true });
  }

  return apiBadRequest('Invalid action. Use "accept", "reject", "ship", or "deliver".');
});
