import type { OrderStatus } from "@prisma/client";
import { ApiRouteError } from "@/lib/api";
import { Status } from "@/lib/api/status";

/** Allowed order status transitions (server-enforced). */
const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING_PAYMENT: ["PAYMENT_CONFIRMED", "CANCELLED"],
  PLACED: ["PAYMENT_CONFIRMED", "PROCESSING", "CANCELLED"],
  PAYMENT_CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

export function assertOrderTransition(from: OrderStatus, to: OrderStatus): void {
  if (from === to) return;
  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new ApiRouteError(
      `Cannot change order from ${formatOrderStatus(from)} to ${formatOrderStatus(to)}.`,
      Status.BAD_REQUEST,
      "INVALID_ORDER_TRANSITION"
    );
  }
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
}

/** Customer may cancel before shipment. */
export const CUSTOMER_CANCELLABLE_ORDER_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PLACED",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
];

function formatOrderStatus(status: OrderStatus): string {
  return status.replace(/_/g, " ").toLowerCase();
}
