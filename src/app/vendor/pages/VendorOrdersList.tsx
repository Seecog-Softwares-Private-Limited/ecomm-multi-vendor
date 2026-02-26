"use client";

import { Link } from "../../components/Link";
import { Search, Filter, Eye, ShoppingBag } from "lucide-react";
import { Button, Input, Select, Card, EmptyState } from "../components/UIComponents";
import * as React from "react";

export function VendorOrdersList() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const orders = [
    {
      id: "#ORD-1234",
      date: "2026-02-25 10:30 AM",
      customer: "Rajesh Kumar",
      phone: "+91 98765*****",
      amount: 2999,
      paymentMode: "Prepaid",
      status: "new" as const,
      itemsCount: 2,
    },
    {
      id: "#ORD-1233",
      date: "2026-02-25 09:15 AM",
      customer: "Priya Sharma",
      phone: "+91 98765*****",
      amount: 1499,
      paymentMode: "COD",
      status: "accepted" as const,
      itemsCount: 1,
    },
    {
      id: "#ORD-1232",
      date: "2026-02-24 04:20 PM",
      customer: "Amit Patel",
      phone: "+91 98765*****",
      amount: 4299,
      paymentMode: "Prepaid",
      status: "shipped" as const,
      itemsCount: 3,
    },
    {
      id: "#ORD-1231",
      date: "2026-02-24 02:45 PM",
      customer: "Sneha Reddy",
      phone: "+91 98765*****",
      amount: 899,
      paymentMode: "Prepaid",
      status: "delivered" as const,
      itemsCount: 1,
    },
    {
      id: "#ORD-1230",
      date: "2026-02-24 11:30 AM",
      customer: "Vikram Singh",
      phone: "+91 98765*****",
      amount: 3499,
      paymentMode: "COD",
      status: "cancelled" as const,
      itemsCount: 2,
    },
  ];

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
    return configs[status];
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Orders</h1>
        <p className="text-[#64748B]">Manage and fulfill your orders</p>
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
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#E2E8F0]">
                  <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Order ID</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Date & Time</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Customer</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Items</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Amount</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Payment</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Status</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <tr key={order.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-bold text-[#1E293B]">{order.id}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-[#64748B]">{order.date}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-[#1E293B]">{order.customer}</p>
                        <p className="text-xs text-[#64748B]">{order.phone}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold text-[#1E293B]">{order.itemsCount}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="font-bold text-[#1E293B]">₹{order.amount}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block text-xs font-bold px-2 py-1 rounded ${
                            order.paymentMode === "Prepaid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.paymentMode}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`${statusConfig.color} text-xs font-bold px-3 py-1.5 rounded-lg border`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Link href={`/vendor/orders/${order.id}`}>
                          <button className="p-2 text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
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
      )}
    </div>
  );
}
