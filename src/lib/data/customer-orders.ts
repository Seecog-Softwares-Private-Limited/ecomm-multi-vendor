import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveProductImageUrl } from "@/lib/product-image";

export type CustomerOrderListRow = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
  previewItems: Array<{
    productId: string;
    productName: string;
    productSlug: string | null;
    imageUrl: string;
    quantity: number;
    variantKey: string | null;
  }>;
};

export type OrderListSort = "newest" | "oldest" | "amount_asc" | "amount_desc";

export type CustomerOrderListQuery = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort?: OrderListSort;
};

export type CustomerOrderListResult = {
  orders: CustomerOrderListRow[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const STATUS_GROUPS: Record<string, OrderStatus[]> = {
  pending: ["PENDING_PAYMENT", "PLACED", "PAYMENT_CONFIRMED"],
  processing: ["PROCESSING"],
  shipped: ["SHIPPED", "OUT_FOR_DELIVERY"],
  delivered: ["DELIVERED"],
  cancelled: ["CANCELLED", "RETURNED"],
};

function mapVariantKey(variantSnapshot: unknown): string | null {
  if (
    variantSnapshot &&
    typeof variantSnapshot === "object" &&
    variantSnapshot !== null &&
    "raw" in variantSnapshot &&
    typeof (variantSnapshot as { raw: unknown }).raw === "string"
  ) {
    return (variantSnapshot as { raw: string }).raw;
  }
  return null;
}

function buildStatusFilter(statusParam?: string): OrderStatus[] | undefined {
  if (!statusParam?.trim()) return undefined;
  const key = statusParam.trim().toLowerCase();
  if (key === "all") return undefined;
  return STATUS_GROUPS[key];
}

function buildOrderBy(sort: OrderListSort): Prisma.OrderOrderByWithRelationInput {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" };
    case "amount_asc":
      return { totalAmount: "asc" };
    case "amount_desc":
      return { totalAmount: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

function mapOrderRow(o: {
  id: string;
  status: OrderStatus;
  totalAmount: Prisma.Decimal;
  createdAt: Date;
  _count: { items: number };
  items: Array<{
    quantity: number;
    productId: string;
    variantSnapshot: unknown;
    product: {
      name: string;
      slug: string | null;
      images: Array<{ url: string }>;
    };
  }>;
}): CustomerOrderListRow {
  return {
    id: o.id,
    status: o.status,
    totalAmount: Number(o.totalAmount),
    createdAt: o.createdAt.toISOString(),
    itemCount: o._count.items,
    previewItems: o.items.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      productSlug: item.product.slug,
      imageUrl: resolveProductImageUrl(item.product.images[0]?.url),
      quantity: item.quantity,
      variantKey: mapVariantKey(item.variantSnapshot),
    })),
  };
}

const orderSelect = {
  id: true,
  status: true,
  totalAmount: true,
  createdAt: true,
  _count: { select: { items: true } },
  items: {
    orderBy: { id: "asc" as const },
    take: 3,
    select: {
      quantity: true,
      productId: true,
      variantSnapshot: true,
      product: {
        select: {
          name: true,
          slug: true,
          images: {
            where: { deletedAt: null },
            orderBy: { sortOrder: "asc" as const },
            take: 1,
            select: { url: true },
          },
        },
      },
    },
  },
} as const;

export async function listCustomerOrders(
  userId: string,
  query: CustomerOrderListQuery = {}
): Promise<CustomerOrderListResult> {
  const hasPaginationParams =
    query.page != null ||
    query.limit != null ||
    query.status != null ||
    query.search != null ||
    query.sort != null;

  const statusFilter = buildStatusFilter(query.status);
  const sort = query.sort ?? "newest";

  const baseWhere: Prisma.OrderWhereInput = {
    userId,
    ...(statusFilter ? { status: { in: statusFilter } } : {}),
  };

  if (!hasPaginationParams) {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: orderSelect,
    });
    return { orders: orders.map(mapOrderRow) };
  }

  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const search = query.search?.trim().toLowerCase() ?? "";

  let orderIds: string[] | undefined;
  if (search) {
    const normalized = search.replace(/^#/, "");
    const matching = await prisma.order.findMany({
      where: {
        userId,
        OR: [
          { id: { contains: normalized } },
          {
            items: {
              some: {
                product: { name: { contains: search } },
              },
            },
          },
        ],
        ...(statusFilter ? { status: { in: statusFilter } } : {}),
      },
      select: { id: true },
    });
    orderIds = matching.map((m) => m.id);
    if (orderIds.length === 0) {
      return {
        orders: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }
  }

  const where: Prisma.OrderWhereInput = {
    ...baseWhere,
    ...(orderIds ? { id: { in: orderIds } } : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: buildOrderBy(sort),
      skip: (page - 1) * limit,
      take: limit,
      select: orderSelect,
    }),
  ]);

  return {
    orders: orders.map(mapOrderRow),
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}
