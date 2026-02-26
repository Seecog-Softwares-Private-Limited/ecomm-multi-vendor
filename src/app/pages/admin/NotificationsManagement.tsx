"use client";

import { Plus, Send } from "lucide-react";
import * as React from "react";

const notifications = [
  { id: 1, type: "System", title: "Server Maintenance", message: "Scheduled maintenance on Feb 25", date: "2026-02-18", read: false },
  { id: 2, type: "Order", title: "High Order Volume", message: "Order volume increased by 45%", date: "2026-02-17", read: true },
  { id: 3, type: "Seller", title: "New Seller Registration", message: "5 new sellers registered today", date: "2026-02-17", read: false },
  { id: 4, type: "Payment", title: "Settlement Completed", message: "Monthly settlements processed", date: "2026-02-16", read: true },
  { id: 5, type: "System", title: "System Update", message: "New features added to admin panel", date: "2026-02-15", read: true },
  { id: 6, type: "Return", title: "Pending Returns", message: "23 return requests awaiting approval", date: "2026-02-15", read: false },
];

export function NotificationsManagement() {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications Management</h1>
          <p className="text-sm text-gray-700 mt-1">Manage system notifications and announcements</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 flex items-center gap-2 font-bold"
        >
          <Send className="w-4 h-4" />
          Send Notification
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-gray-400 p-6 mb-6">
        <div className="flex gap-4">
          <select className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600 font-bold">
            <option>All Types</option>
            <option>System</option>
            <option>Order</option>
            <option>Seller</option>
            <option>Payment</option>
            <option>Return</option>
          </select>

          <select className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600 font-bold">
            <option>All Status</option>
            <option>Read</option>
            <option>Unread</option>
          </select>

          <button className="px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border-2 border-gray-400">
        <div className="divide-y divide-gray-400">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-6 hover:bg-gray-50 ${!notification.read ? 'bg-gray-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex px-3 py-1 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                      {notification.type}
                    </span>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{notification.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                  <p className="text-xs text-gray-600">{notification.date}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  {!notification.read && (
                    <button className="px-3 py-1 text-sm border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold">
                      Mark as Read
                    </button>
                  )}
                  <button className="px-3 py-1 text-sm border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t-2 border-gray-400">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 font-bold">Showing 1 to 6 of 124 notifications</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">Previous</button>
              <button className="px-3 py-1 bg-gray-700 text-white border-2 border-gray-800 text-sm font-bold">1</button>
              <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">2</button>
              <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">3</button>
              <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Send Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-gray-400 max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Send Notification</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Type
                </label>
                <select className="w-full px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600 font-bold">
                  <option>System</option>
                  <option>Order</option>
                  <option>Seller</option>
                  <option>Payment</option>
                  <option>Return</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Notification title"
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Notification message"
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Target Users
                </label>
                <select className="w-full px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600 font-bold">
                  <option>All Users</option>
                  <option>All Sellers</option>
                  <option>All Customers</option>
                  <option>All Admins</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold"
              >
                Cancel
              </button>
              <button className="flex-1 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
