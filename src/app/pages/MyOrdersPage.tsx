"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PackageOpen, RefreshCw } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { OrderListCard, type OrderListRow } from "@/components/orders/OrderListCard";
import { OrderFilterChips } from "@/components/orders/OrderFilterChips";
import { OrderSearchBar } from "@/components/orders/OrderSearchBar";
import { OrderListSkeleton } from "@/components/orders/OrderListSkeleton";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { CustomerErrorState } from "@/components/ui-customer/CustomerErrorState";
import {
  countOrdersByFilter,
  filterOrders,
  groupOrdersByMonth,
  parseOrderFilter,
  type OrderFilter,
} from "@/lib/orders/order-list-utils";

const SEARCH_STORAGE_KEY = "my-orders-search";
const FILTER_STORAGE_KEY = "my-orders-filter";

async function fetchOrders(): Promise<OrderListRow[]> {
  const res = await fetch("/api/orders", { credentials: "include" });
  if (!res.ok) throw new Error("Failed");
  const data = await res.json();
  return (data?.data?.orders ?? []).map((order: OrderListRow) => ({
    ...order,
    previewItems: order.previewItems ?? [],
  }));
}

function MyOrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<OrderListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window === "undefined") return searchParams.get("q") ?? "";
    return searchParams.get("q") ?? sessionStorage.getItem(SEARCH_STORAGE_KEY) ?? "";
  });

  const [activeFilter, setActiveFilter] = useState<OrderFilter>(() => {
    if (typeof window === "undefined") return parseOrderFilter(searchParams.get("status"));
    return parseOrderFilter(
      searchParams.get("status") ?? sessionStorage.getItem(FILTER_STORAGE_KEY)
    );
  });

  const loadOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(false);
    try {
      const next = await fetchOrders();
      setOrders(next);
    } catch {
      setError(true);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders(true);
  }, [loadOrders]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (activeFilter !== "all") params.set("status", activeFilter);
    const next = params.toString();
    const path = next ? `/my-orders?${next}` : "/my-orders";
    router.replace(path, { scroll: false });

    if (typeof window !== "undefined") {
      if (searchQuery.trim()) sessionStorage.setItem(SEARCH_STORAGE_KEY, searchQuery.trim());
      else sessionStorage.removeItem(SEARCH_STORAGE_KEY);
      if (activeFilter !== "all") sessionStorage.setItem(FILTER_STORAGE_KEY, activeFilter);
      else sessionStorage.removeItem(FILTER_STORAGE_KEY);
    }
  }, [searchQuery, activeFilter, router]);

  const { refreshing, progress } = usePullToRefresh({
    onRefresh: () => loadOrders(false),
    enabled: !loading,
  });

  const filterCounts = useMemo(
    () => countOrdersByFilter(orders, searchQuery),
    [orders, searchQuery]
  );

  const filteredOrders = useMemo(
    () => filterOrders(orders, searchQuery, activeFilter),
    [orders, searchQuery, activeFilter]
  );

  const groupedOrders = useMemo(
    () => groupOrdersByMonth(filteredOrders),
    [filteredOrders]
  );

  const hasOrders = orders.length > 0;
  const hasFilteredResults = filteredOrders.length > 0;

  return (
    <AccountLayout>
      {(refreshing || progress > 0) && (
        <div
          className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center bg-white/90 py-2 shadow-sm transition-transform md:hidden"
          style={{ transform: `translateY(${refreshing ? 0 : Math.max(0, progress * 48 - 48)}px)` }}
          aria-live="polite"
        >
          <RefreshCw
            className={`h-5 w-5 text-[#FF6A00] ${refreshing ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          <span className="sr-only">{refreshing ? "Refreshing orders" : "Pull to refresh"}</span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          {!loading && !error && hasOrders && (
            <p className="mt-1 text-sm text-slate-600">
              {filteredOrders.length} of {orders.length} order
              {orders.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {hasOrders && (
          <div className="mb-6 space-y-4">
            <OrderSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              resultCount={searchQuery.trim() ? filteredOrders.length : undefined}
            />
            <OrderFilterChips
              activeFilter={activeFilter}
              counts={filterCounts}
              onChange={setActiveFilter}
            />
          </div>
        )}

        {loading && <OrderListSkeleton />}

        {error && (
          <CustomerErrorState
            title="Couldn't load orders"
            message="Failed to load orders. Please try again."
            onRetry={() => void loadOrders(true)}
          />
        )}

        {!loading && !error && !hasOrders && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <PackageOpen className="h-10 w-10 text-slate-500" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No Orders Yet</h2>
            <p className="mt-2 max-w-sm text-slate-600">
              Looks like you haven&apos;t placed any orders.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#FF6A00] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 focus:ring-offset-2"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && hasOrders && !hasFilteredResults && (
          <div className="py-12 text-center">
            <p className="font-medium text-slate-800">No orders match your search or filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
              className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-[#FF6A00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
            >
              Clear search and filters
            </button>
          </div>
        )}

        {!loading && !error && hasFilteredResults && (
          <div className="space-y-8">
            {groupedOrders.map((group) => (
              <section key={group.key} aria-labelledby={`orders-${group.key}`}>
                <div className="mb-4 flex items-center gap-3">
                  <h2
                    id={`orders-${group.key}`}
                    className="text-lg font-bold text-slate-900"
                  >
                    {group.label}
                  </h2>
                  <div className="h-px flex-1 bg-slate-200" aria-hidden="true" />
                </div>
                <div className="space-y-4">
                  {group.orders.map((order) => (
                    <OrderListCard key={order.id} order={order} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}

export function MyOrdersPage() {
  return (
    <Suspense fallback={<MyOrdersPageFallback />}>
      <MyOrdersPageContent />
    </Suspense>
  );
}

function MyOrdersPageFallback() {
  return (
    <AccountLayout>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">My Orders</h1>
        <OrderListSkeleton />
      </div>
    </AccountLayout>
  );
}
