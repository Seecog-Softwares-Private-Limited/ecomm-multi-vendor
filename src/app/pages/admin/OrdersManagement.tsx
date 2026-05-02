"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Filter, Search, Eye, ShoppingBag, Package, ChevronLeft, ChevronRight, Banknote, Clock, IndianRupee } from "lucide-react";

const PAGE_SIZE = 10;
const PENDING_STATUS_SELECT = "pending_bucket";

/** Match API: table shows `#` + short ID; strip `#` so `contains` matches stored UUIDs. */
function normalizeOrderSearchInput(raw: string): string {
  return raw.trim().replace(/^#+/u, "").trim();
}

const statsConfig = [
  {
    key: "totalOrders" as const,
    action: "all" as const,
    title: "Show all orders (clear status and payment filters)",
    icon: ShoppingBag,
    label: "Total Orders",
    accent: "amber" as const,
  },
  {
    key: "totalRevenue" as const,
    action: "all" as const,
    title: "Show all orders — same list as total orders; revenue is the sum of their amounts",
    icon: IndianRupee,
    label: "Total Revenue",
    accent: "slate" as const,
  },
  {
    key: "paidAmount" as const,
    action: "paid" as const,
    title: "Filter to paid payments only",
    icon: Banknote,
    label: "Paid Amount",
    accent: "emerald" as const,
  },
  {
    key: "unpaidAmount" as const,
    action: "unpaid" as const,
    title: "Filter to unpaid or pending payments",
    icon: Clock,
    label: "Unpaid Amount",
    accent: "blue" as const,
  },
  {
    key: "pendingOrders" as const,
    action: "pending" as const,
    title: "Filter to orders in Placed or Payment confirmed",
    icon: Package,
    label: "Pending Orders",
    accent: "slate" as const,
  },
];

type StatCardAction = (typeof statsConfig)[number]["action"];

/** Stat cards are `<Link>`s; URL drives filters via sync effect. */
function buildOrdersStatHref(
  action: StatCardAction,
  ctx: { search: string; dateFrom: string; dateTo: string }
): string {
  const params = new URLSearchParams();
  params.set("page", "1");
  const q = ctx.search.trim();
  if (q) params.set("search", q);
  if (ctx.dateFrom) params.set("dateFrom", ctx.dateFrom);
  if (ctx.dateTo) params.set("dateTo", ctx.dateTo);

  if (action === "all") {
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  }
  if (action === "paid") {
    params.set("payment", "paid");
    return `/admin/orders?${params.toString()}`;
  }
  if (action === "unpaid") {
    params.set("payment", "unpaid");
    return `/admin/orders?${params.toString()}`;
  }
  params.set("pending", "1");
  return `/admin/orders?${params.toString()}`;
}

interface OrderRow {
  id: string;
  customer: string;
  seller: string;
  amount: number;
  amountFormatted: string;
  paymentStatus: string;
  orderStatus: string;
  orderStatusDisplay: string;
  date: string;
}

interface Summary {
  totalOrdersFormatted: string;
  totalRevenueFormatted: string;
  paidAmountFormatted: string;
  unpaidAmountFormatted: string;
  pendingOrdersFormatted: string;
}

const accentStyles: Record<string, { bg: string; text: string; ring: string }> = {
  amber: { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" },
  blue: { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200" },
  slate: { bg: "bg-slate-100", text: "text-slate-700", ring: "ring-slate-200" },
};

const orderStatusStyles: Record<string, string> = {
  Placed: "bg-slate-50 text-slate-800 ring-1 ring-slate-200",
  "Payment confirmed": "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  Processing: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
  Shipped: "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200",
  "Out for delivery": "bg-violet-50 text-violet-800 ring-1 ring-violet-200",
  Delivered: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  Cancelled: "bg-rose-50 text-rose-800 ring-1 ring-rose-200",
  Returned: "bg-orange-50 text-orange-800 ring-1 ring-orange-200",
};

const paymentStatusStyles: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  Pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
};

export function OrdersManagement() {
  const searchParamsHook = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(() =>
    Math.max(1, parseInt(searchParamsHook.get("page") ?? "1", 10) || 1)
  );
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"" | "paid" | "unpaid">("");
  const [pendingFilter, setPendingFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchInput, setSearchInput] = useState(() =>
    normalizeOrderSearchInput(searchParamsHook?.get("search") ?? "")
  );
  const [search, setSearch] = useState(() =>
    normalizeOrderSearchInput(searchParamsHook?.get("search") ?? "")
  );

  useLayoutEffect(() => {
    const sp = searchParamsHook;
    const pageNum = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
    setPage(pageNum);

    setDateFrom(sp.get("dateFrom") ?? "");
    setDateTo(sp.get("dateTo") ?? "");

    const se = normalizeOrderSearchInput(sp.get("search") ?? "");
    setSearch(se);
    setSearchInput(se);

    const pending = sp.get("pending") === "1" || sp.get("pending")?.toLowerCase() === "true";
    const pr = sp.get("payment")?.toLowerCase();
    const payment = pr === "paid" || pr === "unpaid" ? pr : "";
    const statusRaw = sp.get("status")?.toLowerCase().replace(/-/g, "_") ?? "";

    if (pending) {
      setPendingFilter(true);
      setPaymentFilter("");
      setStatusFilter("");
    } else {
      setPendingFilter(false);
      setPaymentFilter(payment);
      setStatusFilter(statusRaw);
    }
  }, [searchParamsHook]);

  /** Avoid double-fetch when Apply runs `fetchOrders({ page, search })` and state updates retrigger the effect. */
  const skipNextEffectFetchRef = useRef(false);

  const fetchOrders = useCallback(
    async (override?: { page?: number; search?: string }) => {
      setLoading(true);
      setError(null);
      const currentPage = override?.page ?? page;
      const effectiveSearch = override?.search !== undefined ? override.search : search;
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("pageSize", String(PAGE_SIZE));
      if (pendingFilter) {
        params.set("pending", "1");
      } else if (statusFilter) {
        params.set("status", statusFilter);
      }
      if (paymentFilter) params.set("payment", paymentFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (effectiveSearch) params.set("search", effectiveSearch);
      try {
        const res = await fetch(`/api/admin/orders?${params.toString()}`, {
          credentials: "include",
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json?.error?.message ?? "Failed to load orders");
          return;
        }
        if (json.success && json.data) {
          const d = json.data as { orders?: OrderRow[]; summary?: Summary };
          setOrders(d.orders ?? []);
          setSummary(d.summary ?? null);
          const meta = json.meta as { total?: number; totalPages?: number } | undefined;
          setTotal(meta?.total ?? 0);
          setTotalPages(meta?.totalPages ?? 1);
        }
      } catch {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    },
    [page, statusFilter, paymentFilter, pendingFilter, dateFrom, dateTo, search]
  );

  useEffect(() => {
    if (skipNextEffectFetchRef.current) {
      skipNextEffectFetchRef.current = false;
      return;
    }
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handleApplyFilters = () => {
    const q = normalizeOrderSearchInput(searchInput);
    setSearchInput(q);
    setSearch(q);
    setPage(1);
    skipNextEffectFetchRef.current = true;
    void fetchOrders({ page: 1, search: q });
  };

  const isStatCardActive = (key: (typeof statsConfig)[number]["key"], action: (typeof statsConfig)[number]["action"]) => {
    if (statusFilter) return false;
    if (pendingFilter) {
      return key === "pendingOrders" && action === "pending";
    }
    if (paymentFilter === "paid") {
      return key === "paidAmount" && action === "paid";
    }
    if (paymentFilter === "unpaid") {
      return key === "unpaidAmount" && action === "unpaid";
    }
    if (!statusFilter && !paymentFilter && !pendingFilter) {
      return action === "all" && (key === "totalOrders" || key === "totalRevenue");
    }
    return false;
  };

  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  const getSummaryValue = (key: keyof Summary) => {
    if (!summary) return "—";
    return summary[key] ?? "—";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Orders Management
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Manage and track all orders
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Stats cards — full card + icon are one link (URL-synced filters) */}
        <div className="mb-8 grid min-w-0 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statsConfig.map((stat) => {
            const Icon = stat.icon;
            const style = accentStyles[stat.accent];
            const value = getSummaryValue(stat.key + "Formatted" as keyof Summary);
            const active = isStatCardActive(stat.key, stat.action);
            return (
              <Link
                key={stat.label}
                href={buildOrdersStatHref(stat.action, { search, dateFrom, dateTo })}
                scroll={false}
                replace
                prefetch={false}
                title={stat.title}
                aria-current={active ? "true" : undefined}
                className={`group relative flex min-h-[112px] min-w-0 w-full flex-col overflow-hidden rounded-2xl border bg-white p-6 text-left shadow-lg shadow-slate-200/50 ring-offset-2 transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-[0.99] touch-manipulation select-none ${
                  active
                    ? "cursor-pointer border-amber-400 ring-2 ring-amber-400/50"
                    : "cursor-pointer border-slate-200/80 hover:border-amber-200/90"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-2 break-words text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
                      {loading && !summary ? "—" : value}
                    </p>
                  </div>
                  <div
                    className={`pointer-events-none flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition group-hover:ring-2 group-hover:ring-amber-400/40 ${style.bg} ${style.text} ${style.ring}`}
                    aria-hidden
                  >
                    <Icon className="h-5 w-5 shrink-0 pointer-events-none" strokeWidth={2} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <p className="mb-3 text-xs text-slate-500">
            Use <span className="font-medium text-slate-600">Payment → Paid</span> to list every order with a paid
            payment (same as the Payment column). &quot;Payment confirmed&quot; in order status is only the short
            PAYMENT_CONFIRMED step before processing.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search order ID or customer..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                className="w-64 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-4 text-sm text-slate-700 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <select
              value={pendingFilter ? PENDING_STATUS_SELECT : statusFilter}
              onChange={(e) => {
                const v = e.target.value;
                if (v === PENDING_STATUS_SELECT) {
                  setPendingFilter(true);
                  setStatusFilter("");
                } else {
                  setPendingFilter(false);
                  setStatusFilter(v);
                }
              }}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              aria-label="Order status"
            >
              <option value="">All order statuses</option>
              <option value={PENDING_STATUS_SELECT}>Pending (placed or payment confirmed)</option>
              <option value="placed">Placed</option>
              <option value="payment_confirmed">Payment confirmed (order step only)</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => {
                const v = e.target.value;
                setPaymentFilter(v === "paid" || v === "unpaid" ? v : "");
                setPendingFilter(false);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-700 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              aria-label="Payment"
            >
              <option value="">All payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid or pending</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-700 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-700 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-600 bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60"
            >
              <Filter className="h-4 w-4" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Orders table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Order ID
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Seller
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Payment
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Order Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
                      Loading orders…
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">{order.customer}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{order.seller}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {order.amountFormatted}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${
                            paymentStatusStyles[order.paymentStatus] ?? "bg-slate-50 text-slate-700 ring-slate-200"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${
                            orderStatusStyles[order.orderStatusDisplay] ?? "bg-slate-50 text-slate-700 ring-slate-200"
                          }`}
                        >
                          {order.orderStatusDisplay}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{order.date}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{startItem}</span> to{" "}
                <span className="font-medium text-slate-700">{endItem}</span> of{" "}
                <span className="font-medium text-slate-700">{total}</span> orders
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-sm text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
