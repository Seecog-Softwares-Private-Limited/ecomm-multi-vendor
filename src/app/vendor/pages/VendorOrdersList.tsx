"use client";

import { Link } from "../../components/Link";
import { Search, Eye, ShoppingBag } from "lucide-react";
import { Input, Select, Card, EmptyState } from "../components/UIComponents";
import { DataState } from "../../components/DataState";
import { useApi } from "@/lib/hooks/useApi";
import { vendorService } from "@/services/vendor.service";
import * as React from "react";

/** Display order ID for table (short form from UUID). */
function orderDisplayId(id: string): string {
  if (id.startsWith("#")) return id;
  return `#ORD-${id.slice(-6).toUpperCase()}`;
}

export function VendorOrdersList() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const { data, error, isLoading, refetch } = useApi(() =>
    vendorService.getOrders()
  );
  const orders = data ?? [];

  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { label: string; color: string }
    > = {
      new: { label: "New", color: "bg-blue-100 text-blue-700 border-blue-200" },
      accepted: { label: "Accepted", color: "bg-green-100 text-green-700 border-green-200" },
      shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700 border-purple-200" },
      delivered: { label: "Delivered", color: "bg-teal-100 text-teal-700 border-teal-200" },
      cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200" },
      rejected: { label: "Rejected", color: "bg-orange-100 text-orange-700 border-orange-200" },
    };
    return configs[status] ?? { label: status, color: "bg-gray-100 text-gray-700 border-gray-200" };
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderDisplayId(order.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <DataState isLoading={isLoading} error={error} retry={refetch}>
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold leading-snug text-[#1E293B] sm:text-2xl lg:text-3xl">Orders</h1>
        <p className="text-sm leading-relaxed text-[#64748B]">Manage and fulfill your orders</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by order ID or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: "all", label: "All Orders" },
                { value: "new", label: "New" },
                { value: "accepted", label: "Accepted" },
                { value: "shipped", label: "Shipped" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ShoppingBag className="w-12 h-12" />}
            title="No Orders Found"
            description="You don't have any orders yet. Once customers place orders, they'll appear here."
          />
        </Card>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="space-y-3 md:hidden">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/40"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-bold text-[#1E293B]">{orderDisplayId(order.id)}</p>
                      <p className="mt-0.5 text-xs text-[#64748B]">{order.date}</p>
                    </div>
                    <span className={`shrink-0 ${statusConfig.color} rounded-lg border px-2.5 py-1 text-xs font-bold`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="space-y-2 px-4 py-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Customer</p>
                      <p className="break-words font-medium text-[#1E293B]">{order.customer}</p>
                      <p className="text-[#64748B]">{order.phone}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <div>
                        <p className="text-xs font-semibold text-[#94A3B8]">Amount</p>
                        <p className="font-bold text-[#1E293B]">₹{order.amount}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#94A3B8]">Items</p>
                        <p className="font-semibold text-[#1E293B]">{order.itemsCount}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#94A3B8]">Payment</p>
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                            order.paymentMode === "Prepaid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.paymentMode}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 px-4 py-3">
                    <Link
                      href={`/vendor/orders/${order.id}`}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] text-sm font-semibold text-white transition hover:bg-[#2563EB]"
                    >
                      <Eye className="h-4 w-4" />
                      View order
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table */}
          <Card className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b-2 border-[#E2E8F0]">
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase text-[#64748B]">Order ID</th>
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase text-[#64748B]">Date & Time</th>
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase text-[#64748B]">Customer</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase text-[#64748B]">Items</th>
                    <th className="px-4 py-4 text-right text-sm font-bold uppercase text-[#64748B]">Amount</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase text-[#64748B]">Payment</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase text-[#64748B]">Status</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase text-[#64748B]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr key={order.id} className="border-b border-[#E2E8F0] transition-colors hover:bg-[#F8FAFC]">
                        <td className="px-4 py-4">
                          <p className="font-bold text-[#1E293B]">{orderDisplayId(order.id)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-[#64748B]">{order.date}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-[#1E293B]">{order.customer}</p>
                          <p className="text-xs text-[#64748B]">{order.phone}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-semibold text-[#1E293B]">{order.itemsCount}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="font-bold text-[#1E293B]">₹{order.amount}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs font-bold ${
                              order.paymentMode === "Prepaid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.paymentMode}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`${statusConfig.color} rounded-lg border px-3 py-1.5 text-xs font-bold`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Link href={`/vendor/orders/${order.id}`}>
                            <button
                              type="button"
                              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 text-[#3B82F6] transition-colors hover:bg-blue-50"
                              aria-label="View order"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
    </DataState>
  );
}
