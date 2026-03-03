import { OrderStatus, PaymentMode, PaymentStatus } from "@prisma/client";
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

    list.push({
      id: order.id,
      date: formatOrderDate(order.createdAt),
      createdAt: order.createdAt.toISOString(),
      customer,
      phone: maskPhone(phone),
      amount,
      paymentMode,
      status: mapOrderStatus(order.status),
      itemsCount,
    });
  }

  list.sort((a, b) => b.date.localeCompare(a.date));
  return list;
}

/**
 * Get IDs needed for Create Order (testing): one customer with an address, and one ACTIVE product for this vendor.
 * Returns null if no user with address exists or vendor has no ACTIVE product.
 */
export async function getCreateOrderTestData(sellerId: string): Promise<{
  customerUserId: string;
  shippingAddressId: string;
  productId: string;
  productName: string;
  customerEmail: string;
} | null> {
  const address = await prisma.address.findFirst({
    where: { deletedAt: null },
    select: { id: true, userId: true, user: { select: { email: true } } },
  });
  if (!address) return null;

  const product = await prisma.product.findFirst({
    where: { sellerId, status: "ACTIVE", deletedAt: null },
    select: { id: true, name: true },
  });
  if (!product) return null;

  return {
    customerUserId: address.userId,
    shippingAddressId: address.id,
    productId: product.id,
    productName: product.name,
    customerEmail: address.user.email,
  };
}

/** Input for creating a test order (vendor creates order for a customer). */
export interface CreateVendorOrderInput {
  customerUserId: string;
  shippingAddressId: string;
  items: { productId: string; quantity: number }[];
}

/**
 * Create an order as the logged-in vendor (for testing). All products must belong to this vendor.
 * Creates Order, OrderItems, and a single Payment (PAID). Customer must exist and address must belong to them.
 */
export async function createVendorOrder(
  sellerId: string,
  input: CreateVendorOrderInput
): Promise<{ orderId: string; totalAmount: number }> {
  const { customerUserId, shippingAddressId, items } = input;
  if (!items.length) {
    throw new Error("At least one item is required");
  }

  const address = await prisma.address.findFirst({
    where: { id: shippingAddressId, userId: customerUserId, deletedAt: null },
  });
  if (!address) {
    throw new Error("Shipping address not found or does not belong to customer");
  }

  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      sellerId,
      status: "ACTIVE",
      deletedAt: null,
    },
    select: { id: true, sellingPrice: true, sku: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  if (productMap.size !== productIds.length) {
    const missing = productIds.filter((id) => !productMap.has(id));
    throw new Error(`Product(s) not found or not yours or not active: ${missing.join(", ")}`);
  }

  let totalAmount = 0;
  const orderItemsData: { productId: string; quantity: number; unitPrice: number; totalPrice: number; sku: string | null }[] = [];
  for (const { productId, quantity } of items) {
    if (quantity < 1) throw new Error(`Invalid quantity for product ${productId}`);
    const product = productMap.get(productId)!;
    const unitPrice = toNumber(product.sellingPrice);
    const totalPrice = unitPrice * quantity;
    totalAmount += totalPrice;
    orderItemsData.push({
      productId,
      quantity,
      unitPrice,
      totalPrice,
      sku: product.sku,
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId: customerUserId,
        shippingAddressId,
        status: OrderStatus.PAYMENT_CONFIRMED,
        totalAmount,
        discountAmount: 0,
        taxAmount: 0,
        shippingAmount: 0,
      },
      select: { id: true },
    });

    for (const item of orderItemsData) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          sellerId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          sku: item.sku,
        },
      });
    }

    await tx.payment.create({
      data: {
        orderId: order.id,
        mode: PaymentMode.PREPAID,
        status: PaymentStatus.PAID,
        amount: totalAmount,
        paidAt: new Date(),
      },
    });

    await tx.orderStatusEvent.create({
      data: { orderId: order.id, status: OrderStatus.PAYMENT_CONFIRMED },
    });

    return { orderId: order.id, totalAmount };
  });

  return result;
}
