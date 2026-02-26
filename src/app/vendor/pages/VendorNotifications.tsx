"use client";

import { Bell, Check, Package, DollarSign, AlertCircle, Info } from "lucide-react";
import { Card, Button } from "../components/UIComponents";
import * as React from "react";

export function VendorNotifications() {
  const [filter, setFilter] = React.useState<"all" | "unread" | "read">("all");

  const notifications = [
    {
      id: 1,
      type: "order",
      title: "New Order Received",
      message: "Order #ORD-1234 has been placed. Please accept or reject within 24 hours.",
      time: "10 minutes ago",
      read: false,
      icon: Package,
      color: "text-blue-600 bg-blue-100",
    },
    {
      id: 2,
      type: "payout",
      title: "Payout Processed",
      message: "₹8,827 has been transferred to your bank account (PAY-2026-02-001).",
      time: "2 hours ago",
      read: false,
      icon: DollarSign,
      color: "text-green-600 bg-green-100",
    },
    {
      id: 3,
      type: "product",
      title: "Product Approved",
      message: "Your product 'Wireless Bluetooth Headphones' has been approved and is now live.",
      time: "5 hours ago",
      read: true,
      icon: Check,
      color: "text-green-600 bg-green-100",
    },
    {
      id: 4,
      type: "alert",
      title: "Low Stock Alert",
      message: "Product 'USB Cable' has only 5 units left in stock.",
      time: "1 day ago",
      read: true,
      icon: AlertCircle,
      color: "text-orange-600 bg-orange-100",
    },
    {
      id: 5,
      type: "order",
      title: "Order Cancelled",
      message: "Order #ORD-1230 has been cancelled by the customer.",
      time: "2 days ago",
      read: true,
      icon: Package,
      color: "text-red-600 bg-red-100",
    },
    {
      id: 6,
      type: "info",
      title: "KYC Verification Complete",
      message: "Your vendor profile has been verified. You can now start selling.",
      time: "3 days ago",
      read: true,
      icon: Info,
      color: "text-blue-600 bg-blue-100",
    },
  ];

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    alert(`Notification ${id} marked as read`);
  };

  const handleMarkAllAsRead = () => {
    alert("All notifications marked as read");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Notifications</h1>
          <p className="text-[#64748B]">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={handleMarkAllAsRead}>
            <Check className="w-5 h-5" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            filter === "all"
              ? "bg-[#3B82F6] text-white shadow-lg"
              : "bg-white text-[#64748B] border-2 border-[#E2E8F0] hover:border-[#3B82F6]"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            filter === "unread"
              ? "bg-[#3B82F6] text-white shadow-lg"
              : "bg-white text-[#64748B] border-2 border-[#E2E8F0] hover:border-[#3B82F6]"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter("read")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            filter === "read"
              ? "bg-[#3B82F6] text-white shadow-lg"
              : "bg-white text-[#64748B] border-2 border-[#E2E8F0] hover:border-[#3B82F6]"
          }`}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-[#64748B]" />
              </div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-2">No Notifications</h3>
              <p className="text-[#64748B]">You're all caught up!</p>
            </div>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card key={notification.id}>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 ${notification.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-bold ${notification.read ? "text-[#64748B]" : "text-[#1E293B]"}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-sm text-[#64748B] mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#94A3B8]">{notification.time}</p>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-[#3B82F6] hover:text-[#2563EB] font-semibold"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
