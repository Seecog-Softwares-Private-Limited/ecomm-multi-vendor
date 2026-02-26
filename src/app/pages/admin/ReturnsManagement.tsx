"use client";

import { Eye, CheckCircle, XCircle } from "lucide-react";
import * as React from "react";

const returns = [
  { id: "#RET-789", orderId: "#ORD-12345", seller: "Tech Store", customer: "John Doe", amount: "$299.99", reason: "Defective product", status: "Pending", date: "2026-02-18" },
  { id: "#RET-788", orderId: "#ORD-12340", seller: "Fashion Hub", customer: "Jane Smith", amount: "$149.99", reason: "Wrong size", status: "Approved", date: "2026-02-17" },
  { id: "#RET-787", orderId: "#ORD-12335", seller: "Sports Gear", customer: "Bob Johnson", amount: "$199.99", reason: "Not as described", status: "Pending", date: "2026-02-17" },
  { id: "#RET-786", orderId: "#ORD-12330", seller: "Electronics Plus", customer: "Alice Brown", amount: "$449.99", reason: "Changed mind", status: "Rejected", date: "2026-02-16" },
  { id: "#RET-785", orderId: "#ORD-12325", seller: "Home Decor", customer: "Charlie Wilson", amount: "$89.99", reason: "Damaged in shipping", status: "Approved", date: "2026-02-16" },
];

export function ReturnsManagement() {
  const [showDetailModal, setShowDetailModal] = React.useState(false);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Returns & Refund Management</h1>
        <p className="text-sm text-gray-700 mt-1">Manage return requests and process refunds</p>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-gray-400 p-6 mb-6">
        <div className="flex gap-4">
          <select className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600 font-bold">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>

          <input
            type="date"
            className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600"
          />

          <button className="px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white border-2 border-gray-400">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b-2 border-gray-400">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Return ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Refund Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {returns.map((returnItem) => (
                <tr key={returnItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{returnItem.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{returnItem.orderId}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{returnItem.seller}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{returnItem.customer}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{returnItem.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{returnItem.reason}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                      {returnItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{returnItem.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowDetailModal(true)}
                        className="p-2 border-2 border-gray-400 hover:bg-gray-100"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-700" />
                      </button>
                      {returnItem.status === 'Pending' && (
                        <>
                          <button className="p-2 border-2 border-gray-400 hover:bg-gray-100" title="Approve">
                            <CheckCircle className="w-4 h-4 text-gray-700" />
                          </button>
                          <button className="p-2 border-2 border-gray-400 hover:bg-gray-100" title="Reject">
                            <XCircle className="w-4 h-4 text-gray-700" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t-2 border-gray-400 flex items-center justify-between">
          <p className="text-sm text-gray-700 font-bold">Showing 1 to 5 of 47 returns</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">Previous</button>
            <button className="px-3 py-1 bg-gray-700 text-white border-2 border-gray-800 text-sm font-bold">1</button>
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">2</button>
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">Next</button>
          </div>
        </div>
      </div>

      {/* Return Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-400 max-w-2xl w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Return Request Details</h3>
            
            <div className="space-y-4">
              <div className="aspect-video bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
                <p className="text-gray-600 font-bold">PRODUCT IMAGE</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">Return ID</label>
                  <p className="mt-1 text-gray-900">#RET-789</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Order ID</label>
                  <p className="mt-1 text-gray-900">#ORD-12345</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Product Name</label>
                  <p className="mt-1 text-gray-900">Wireless Headphones Pro</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Refund Amount</label>
                  <p className="mt-1 text-gray-900">$299.99</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700">Return Reason</label>
                  <p className="mt-1 text-gray-900">Defective product - Not charging properly</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700">Customer Comments</label>
                  <p className="mt-1 text-gray-900">The product stopped charging after 2 days of use. Tried different cables but issue persists.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 py-2 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold"
              >
                Close
              </button>
              <button className="flex-1 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                Approve Refund
              </button>
              <button className="flex-1 py-2 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
