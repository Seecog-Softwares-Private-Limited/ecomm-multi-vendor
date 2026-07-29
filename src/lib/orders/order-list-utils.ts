import type { OrderListRow } from "@/components/orders/OrderListCard";

export type OrderFilter =
  | "all"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_FILTERS: Array<{ id: OrderFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export function getStatusCategory(
  status: string
): Exclude<OrderFilter, "all"> {
  if (status === "DELIVERED") return "delivered";
  if (status === "CANCELLED" || status === "RETURNED") return "cancelled";
  if (status === "SHIPPED" || status === "OUT_FOR_DELIVERY") return "shipped";
  if (status === "PROCESSING") return "processing";
  return "pending";
}

export function displayOrderId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

export function matchesOrderSearch(order: OrderListRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const normalized = q.replace(/^#/, "");
  if (order.id.toLowerCase().includes(normalized)) return true;
  if (order.id.slice(0, 8).toLowerCase().includes(normalized)) return true;
  if (displayOrderId(order.id).toLowerCase().includes(q)) return true;

  return order.previewItems.some((item) =>
    item.productName.toLowerCase().includes(q)
  );
}

export function matchesOrderFilter(order: OrderListRow, filter: OrderFilter): boolean {
  if (filter === "all") return true;
  return getStatusCategory(order.status) === filter;
}

export function filterOrders(
  orders: OrderListRow[],
  query: string,
  filter: OrderFilter
): OrderListRow[] {
  return orders.filter(
    (order) => matchesOrderSearch(order, query) && matchesOrderFilter(order, filter)
  );
}

export function countOrdersByFilter(
  orders: OrderListRow[],
  query: string
): Record<OrderFilter, number> {
  const counts: Record<OrderFilter, number> = {
    all: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const order of orders) {
    if (!matchesOrderSearch(order, query)) continue;
    counts.all += 1;
    counts[getStatusCategory(order.status)] += 1;
  }

  return counts;
}

export type OrderMonthGroup = {
  key: string;
  label: string;
  orders: OrderListRow[];
};

export function groupOrdersByMonth(orders: OrderListRow[]): OrderMonthGroup[] {
  const map = new Map<string, OrderListRow[]>();

  for (const order of orders) {
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const bucket = map.get(key);
    if (bucket) bucket.push(order);
    else map.set(key, [order]);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, groupOrders]) => ({
      key,
      label: new Date(groupOrders[0]!.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
      orders: groupOrders,
    }));
}

export function parseOrderFilter(value: string | null): OrderFilter {
  if (
    value === "pending" ||
    value === "processing" ||
    value === "shipped" ||
    value === "delivered" ||
    value === "cancelled"
  ) {
    return value;
  }
  return "all";
}
