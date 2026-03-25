import type { OrderItemStatus, OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const toNumber = (v: unknown): number =>
  typeof v === "number" ? v : Number(v) ?? 0;

/** UI-friendly order status for vendor list. */
export type VendorOrderListStatus =
  | "new"
  | "accepted"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "rejected";

function mapOrderStatus(status: string): VendorOrderListStatus {
  switch (status) {
    case "PLACED":
    case "PAYMENT_CONFIRMED":
      return "new";
    case "PROCESSING":
      return "accepted";
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return "shipped";
    case "DELIVERED":
      return "delivered";
    case "CANCELLED":
    case "RETURNED":
      return "cancelled";
    default:
      return "new";
  }
}

/** Badge + action buttons for this vendor's slice of the order (line items). */
export function deriveVendorUiStatus(
  orderStatus: OrderStatus,
  sellerItemStatuses: OrderItemStatus[]
): VendorOrderListStatus {
  if (orderStatus === "CANCELLED" || orderStatus === "RETURNED") return "cancelled";
  if (sellerItemStatuses.length === 0) return mapOrderStatus(orderStatus);
  if (sellerItemStatuses.every((s) => s === "REJECTED")) return "rejected";
  if (sellerItemStatuses.some((s) => s === "NEW")) return "new";
  if (sellerItemStatuses.every((s) => s === "DELIVERED")) return "delivered";
  if (sellerItemStatuses.some((s) => s === "SHIPPED" || s === "DELIVERED")) return "shipped";
  if (sellerItemStatuses.every((s) => s === "ACCEPTED")) return "accepted";
  return "accepted";
}

function mapPaymentMode(mode: string): string {
  switch (mode) {
    case "PREPAID":
      return "Prepaid";
    case "COD":
      return "COD";
    case "WALLET":
      return "Wallet";
    case "CARD":
      return "Card";
    case "UPI":
      return "UPI";
    default:
      return mode || "—";
  }
}

function mapPaymentStatus(status: PaymentStatus): string {
  switch (status) {
    case "PAID":
      return "Paid";
    case "PENDING":
      return "Pending";
    case "FAILED":
      return "Failed";
    case "REFUNDED":
      return "Refunded";
    case "PARTIALLY_REFUNDED":
      return "Partially refunded";
    default:
      return status;
  }
}

function formatOrderDate(d: Date): string {
  const date = new Date(d);
  const datePart = date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timePart = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} ${timePart}`;
}

/** Mask phone for display (e.g. +91 98765*****). */
function maskPhone(phone: string | null): string {
  if (!phone || phone.length < 6) return "—";
  const last = phone.slice(-4);
  const prefix = phone.slice(0, Math.min(phone.length - 4, 6));
  return `${prefix}****${last}`;
}

export interface VendorOrderListItem {
  id: string;
  date: string;
  createdAt?: string;
  customer: string;
  phone: string;
  amount: number;
  paymentMode: string;
  status: VendorOrderListStatus;
  itemsCount: number;
}

/**
 * List orders for a vendor (seller): orders that have at least one OrderItem
 * belonging to this seller. Each row is one order with this seller's item count
 * and amount. Optional dateFrom/dateTo filter by order.createdAt (YYYY-MM-DD).
 */
export async function getVendorOrdersBySellerId(
  sellerId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<VendorOrderListItem[]> {
  const orderDateFilter: { gte?: Date; lte?: Date } = {};
  if (dateFrom) orderDateFilter.gte = new Date(dateFrom + "T00:00:00.000Z");
  if (dateTo) orderDateFilter.lte = new Date(dateTo + "T23:59:59.999Z");
  const hasOrderDateFilter = dateFrom || dateTo;

  const items = await prisma.orderItem.findMany({
    where: {
      sellerId,
      ...(hasOrderDateFilter && { order: { createdAt: orderDateFilter } }),
    },
    include: {
      order: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          shippingAddress: {
            select: { fullName: true, phone: true },
          },
          payments: {
            take: 1,
            orderBy: { createdAt: "asc" },
            select: { mode: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by order id: one row per order with this seller's items count and amount.
  // Preserve order by first-seen (items are already ordered by createdAt desc).
  const byOrderId = new Map<
    string,
    {
      order: (typeof items)[0]["order"];
      itemsCount: number;
      amount: number;
    }
  >;
  const orderIds: string[] = [];

  for (const item of items) {
    const o = item.order;
    const existing = byOrderId.get(o.id);
    const itemTotal = toNumber(item.totalPrice);
    if (existing) {
      existing.itemsCount += item.quantity;
      existing.amount += itemTotal;
    } else {
      orderIds.push(o.id);
      byOrderId.set(o.id, {
        order: o,
        itemsCount: item.quantity,
        amount: itemTotal,
      });
    }
  }

  const list: VendorOrderListItem[] = [];
  for (const orderId of orderIds) {
    const row = byOrderId.get(orderId);
    if (!row) continue;
    const { order, itemsCount, amount } = row;
    const userName = [order.user.firstName, order.user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    const customer =
      userName || order.shippingAddress?.fullName || "Customer";
    const phone =
      order.shippingAddress?.phone || order.user?.phone || "";
    const paymentMode = order.payments[0]
      ? mapPaymentMode(order.payments[0].mode)
      : "—";

    const sellerStatuses = items
      .filter((it) => it.order.id === orderId && it.sellerId === sellerId)
      .map((it) => it.status);

    list.push({
      id: order.id,
      date: formatOrderDate(order.createdAt),
      createdAt: order.createdAt.toISOString(),
      customer,
      phone: maskPhone(phone),
      amount,
      paymentMode,
      status: deriveVendorUiStatus(order.status, sellerStatuses),
      itemsCount,
    });
  }

  list.sort((a, b) => b.date.localeCompare(a.date));
  return list;
}

const STATUS_RANK: OrderStatus[] = [
  "PLACED",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

function orderStatusRank(status: OrderStatus): number {
  const i = STATUS_RANK.indexOf(status);
  if (i >= 0) return i;
  return -1;
}

/** Timeline on vendor order page: step 2 follows this vendor's line items; later steps use order + items. */
function buildVendorTimelineForSeller(
  orderStatus: OrderStatus,
  events: { status: OrderStatus; occurredAt: Date }[],
  sellerItems: { status: OrderItemStatus }[]
): Array<{ label: string; date: string; completed: boolean }> {
  const cancelled = orderStatus === "CANCELLED" || orderStatus === "RETURNED";
  const rank = orderStatusRank(orderStatus);

  const eventDate = (statuses: OrderStatus[]): string => {
    for (const s of statuses) {
      const ev = events.find((e) => e.status === s);
      if (ev) return formatOrderDate(ev.occurredAt);
    }
    return "";
  };

  const placedDate = eventDate(["PLACED", "PAYMENT_CONFIRMED"]);
  const processingDate = eventDate(["PROCESSING"]);
  const noneNew =
    sellerItems.length > 0 && sellerItems.every((i) => i.status !== "NEW");
  const allRejected =
    sellerItems.length > 0 && sellerItems.every((i) => i.status === "REJECTED");
  const anyShipped = sellerItems.some(
    (i) => i.status === "SHIPPED" || i.status === "DELIVERED"
  );
  const allDelivered =
    sellerItems.length > 0 && sellerItems.every((i) => i.status === "DELIVERED");

  return [
    { label: "Order Placed", date: placedDate, completed: !cancelled },
    {
      label: "Accepted by Vendor",
      date: noneNew && !allRejected ? processingDate : "",
      completed: !cancelled && noneNew && !allRejected,
    },
    {
      label: "Shipped",
      date: eventDate(["SHIPPED"]),
      completed: !cancelled && (rank >= 3 || anyShipped),
    },
    {
      label: "Out for Delivery",
      date: eventDate(["OUT_FOR_DELIVERY"]),
      completed: !cancelled && rank >= 4,
    },
    {
      label: "Delivered",
      date: eventDate(["DELIVERED"]),
      completed: !cancelled && (rank >= 5 || allDelivered),
    },
  ];
}

const PLACEHOLDER_IMG = "https://via.placeholder.com/100";

/** Latest note from a CANCELLED status event (e.g. customer or system cancellation). */
function cancellationNoteFromEvents(
  orderStatus: OrderStatus,
  events: { status: OrderStatus; note: string | null; occurredAt: Date }[]
): string | null {
  if (orderStatus !== "CANCELLED") return null;
  const withNote = events.filter((e) => e.status === "CANCELLED" && e.note?.trim());
  if (withNote.length === 0) return null;
  withNote.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  return withNote[0]!.note!.trim();
}

/** Full order detail for vendor UI (this seller's line items only). */
export interface VendorOrderDetailDto {
  id: string;
  date: string;
  status: VendorOrderListStatus;
  /** Set when the order is cancelled — from OrderStatusEvent (includes customer reason). */
  cancellationNote: string | null;
  customer: { name: string; phone: string; email: string };
  address: { line1: string; line2: string; city: string; state: string; pincode: string };
  items: Array<{ name: string; sku: string; qty: number; price: number; image: string }>;
  payment: { mode: string; status: string; transactionId: string };
  earnings: {
    itemTotal: number;
    commissionPercent: number;
    commissionAmount: number;
    netPayable: number;
  };
  timeline: Array<{ label: string; date: string; completed: boolean }>;
}

/**
 * Single order for vendor dashboard: only if the order contains at least one item for this seller.
 */
export async function getVendorOrderDetailForSeller(
  sellerId: string,
  orderId: string
): Promise<VendorOrderDetailDto | null> {
  const id = orderId.trim();
  if (!id) return null;

  const order = await prisma.order.findFirst({
    where: {
      id,
      items: { some: { sellerId } },
    },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true, phone: true },
      },
      shippingAddress: true,
      items: {
        where: { sellerId },
        include: {
          product: {
            select: {
              name: true,
              images: {
                where: { deletedAt: null },
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      payments: { orderBy: { createdAt: "asc" } },
      statusEvents: { orderBy: { occurredAt: "asc" } },
    },
  });

  if (!order) return null;

  const userName = [order.user.firstName, order.user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const customerName = userName || order.shippingAddress?.fullName || "Customer";
  const rawPhone = order.shippingAddress?.phone || order.user.phone || "";
  const addr = order.shippingAddress;

  let itemTotal = 0;
  let commissionAmount = 0;
  let netPayableSum = 0;

  const items = order.items.map((it) => {
    const gross = toNumber(it.totalPrice);
    itemTotal += gross;
    const comm = toNumber(it.commissionAmount);
    commissionAmount += comm;
    const net =
      it.netPayable != null ? toNumber(it.netPayable) : Math.max(0, gross - comm);
    netPayableSum += net;

    const img = it.product?.images?.[0]?.url?.trim();
    return {
      name: it.product?.name ?? "Product",
      sku: it.sku?.trim() || "—",
      qty: it.quantity,
      price: Math.round(toNumber(it.unitPrice) * 100) / 100,
      image: img && img.length > 0 ? img : PLACEHOLDER_IMG,
    };
  });

  const commissionPercent =
    itemTotal > 0 ? Math.round((commissionAmount / itemTotal) * 1000) / 10 : 0;

  const payment = order.payments[0];
  const paymentBlock = payment
    ? {
        mode: mapPaymentMode(payment.mode),
        status: mapPaymentStatus(payment.status),
        transactionId: payment.transactionId?.trim() ?? "",
      }
    : { mode: "—", status: "—", transactionId: "" };

  const sellerItemStatuses = order.items.map((it) => it.status);

  return {
    id: order.id,
    date: formatOrderDate(order.createdAt),
    status: deriveVendorUiStatus(order.status, sellerItemStatuses),
    cancellationNote: cancellationNoteFromEvents(order.status, order.statusEvents),
    customer: {
      name: customerName,
      phone: maskPhone(rawPhone),
      email: order.user.email ?? "—",
    },
    address: {
      line1: addr?.line1 ?? "—",
      line2: addr?.line2?.trim() ?? "",
      city: addr?.city ?? "—",
      state: addr?.state ?? "—",
      pincode: addr?.pincode ?? "—",
    },
    items,
    payment: paymentBlock,
    earnings: {
      itemTotal: Math.round(itemTotal * 100) / 100,
      commissionPercent,
      commissionAmount: Math.round(commissionAmount * 100) / 100,
      netPayable: Math.round(netPayableSum * 100) / 100,
    },
    timeline: buildVendorTimelineForSeller(order.status, order.statusEvents, order.items),
  };
}

export async function vendorAcceptOrder(
  sellerId: string,
  orderId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = orderId.trim();
  if (!id) return { ok: false, error: "Invalid order" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, items: { some: { sellerId } } },
        select: { id: true, status: true },
      });
      if (!order) return "NOT_FOUND" as const;
      if (order.status === "CANCELLED" || order.status === "RETURNED") {
        return "INVALID_STATE" as const;
      }

      const updated = await tx.orderItem.updateMany({
        where: { orderId: id, sellerId, status: "NEW" },
        data: { status: "ACCEPTED" },
      });

      if (updated.count === 0) {
        const mine = await tx.orderItem.findMany({
          where: { orderId: id, sellerId },
          select: { id: true },
        });
        if (mine.length === 0) return "NOT_FOUND" as const;
        return "OK" as const;
      }

      if (order.status === "PLACED" || order.status === "PAYMENT_CONFIRMED") {
        await tx.order.update({
          where: { id },
          data: { status: "PROCESSING" },
        });
        await tx.orderStatusEvent.create({
          data: {
            orderId: id,
            status: "PROCESSING",
            note: "Vendor accepted order",
          },
        });
      }

      return "OK" as const;
    });

    if (result === "NOT_FOUND") return { ok: false, error: "NOT_FOUND" };
    if (result === "INVALID_STATE") return { ok: false, error: "INVALID_STATE" };
    return { ok: true };
  } catch {
    return { ok: false, error: "TRANSACTION_FAILED" };
  }
}

export async function vendorRejectOrder(
  sellerId: string,
  orderId: string,
  reason: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = orderId.trim();
  if (!id) return { ok: false, error: "Invalid order" };
  const note = reason.trim().slice(0, 450);
  if (!note) return { ok: false, error: "REASON_REQUIRED" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, items: { some: { sellerId } } },
        select: { id: true, status: true },
      });
      if (!order) return "NOT_FOUND" as const;
      if (order.status === "CANCELLED" || order.status === "RETURNED") {
        return "INVALID_STATE" as const;
      }

      const updated = await tx.orderItem.updateMany({
        where: { orderId: id, sellerId, status: "NEW" },
        data: { status: "REJECTED" },
      });
      if (updated.count === 0) {
        const anyNew = await tx.orderItem.findFirst({
          where: { orderId: id, sellerId, status: "NEW" },
        });
        if (anyNew) return "INVALID_STATE" as const;
        return "OK" as const;
      }

      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          status: order.status,
          note: `Vendor rejected items: ${note}`,
        },
      });

      const allItems = await tx.orderItem.findMany({ where: { orderId: id } });
      const allTerminal = allItems.every(
        (i) => i.status === "REJECTED" || i.status === "CANCELLED"
      );
      if (allTerminal && allItems.length > 0) {
        await tx.order.update({ where: { id }, data: { status: "CANCELLED" } });
        await tx.orderStatusEvent.create({
          data: {
            orderId: id,
            status: "CANCELLED",
            note: "All line items rejected or cancelled",
          },
        });
      }

      return "OK" as const;
    });

    if (result === "NOT_FOUND") return { ok: false, error: "NOT_FOUND" };
    if (result === "INVALID_STATE") return { ok: false, error: "INVALID_STATE" };
    return { ok: true };
  } catch {
    return { ok: false, error: "TRANSACTION_FAILED" };
  }
}

export async function vendorShipOrder(
  sellerId: string,
  orderId: string,
  courierName: string,
  trackingLink?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = orderId.trim();
  if (!id) return { ok: false, error: "Invalid order" };
  const courier = courierName.trim();
  if (!courier) return { ok: false, error: "COURIER_REQUIRED" };

  const shipNote = trackingLink?.trim()
    ? `Shipped via ${courier} — ${trackingLink.trim()}`.slice(0, 500)
    : `Shipped via ${courier}`.slice(0, 500);

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, items: { some: { sellerId } } },
        select: { id: true, status: true },
      });
      if (!order) throw new Error("NOT_FOUND");
      if (order.status === "CANCELLED" || order.status === "RETURNED") {
        throw new Error("INVALID_STATE");
      }

      const upd = await tx.orderItem.updateMany({
        where: { orderId: id, sellerId, status: "ACCEPTED" },
        data: { status: "SHIPPED" },
      });
      if (upd.count === 0) throw new Error("NOTHING_TO_SHIP");

      const allItems = await tx.orderItem.findMany({ where: { orderId: id } });
      const allShipped = allItems.every((i) =>
        ["SHIPPED", "DELIVERED"].includes(i.status)
      );

      if (allShipped) {
        if (
          order.status !== "SHIPPED" &&
          order.status !== "OUT_FOR_DELIVERY" &&
          order.status !== "DELIVERED"
        ) {
          await tx.order.update({ where: { id }, data: { status: "SHIPPED" } });
          await tx.orderStatusEvent.create({
            data: { orderId: id, status: "SHIPPED", note: shipNote },
          });
        }
      } else {
        await tx.orderStatusEvent.create({
          data: {
            orderId: id,
            status: order.status,
            note: shipNote,
          },
        });
      }
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND") return { ok: false, error: "NOT_FOUND" };
    if (msg === "INVALID_STATE") return { ok: false, error: "INVALID_STATE" };
    if (msg === "NOTHING_TO_SHIP") return { ok: false, error: "NOTHING_TO_SHIP" };
    return { ok: false, error: "TRANSACTION_FAILED" };
  }
}

export async function vendorDeliverOrder(
  sellerId: string,
  orderId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = orderId.trim();
  if (!id) return { ok: false, error: "Invalid order" };

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, items: { some: { sellerId } } },
        select: { id: true, status: true },
      });
      if (!order) throw new Error("NOT_FOUND");
      if (order.status === "CANCELLED" || order.status === "RETURNED") {
        throw new Error("INVALID_STATE");
      }

      const upd = await tx.orderItem.updateMany({
        where: { orderId: id, sellerId, status: "SHIPPED" },
        data: { status: "DELIVERED" },
      });
      if (upd.count === 0) throw new Error("NOTHING_TO_DELIVER");

      const allItems = await tx.orderItem.findMany({ where: { orderId: id } });
      const allDelivered = allItems.every((i) => i.status === "DELIVERED");

      if (allDelivered) {
        await tx.order.update({ where: { id }, data: { status: "DELIVERED" } });
        await tx.orderStatusEvent.create({
          data: {
            orderId: id,
            status: "DELIVERED",
            note: "Order delivered (all items)",
          },
        });
      }
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND") return { ok: false, error: "NOT_FOUND" };
    if (msg === "INVALID_STATE") return { ok: false, error: "INVALID_STATE" };
    if (msg === "NOTHING_TO_DELIVER") return { ok: false, error: "NOTHING_TO_DELIVER" };
    return { ok: false, error: "TRANSACTION_FAILED" };
  }
}
