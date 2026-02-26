"use client";

import { Link } from "../../components/Link";
import { 
  ArrowLeft, Search, Filter, Eye, Download, Printer, 
  Package, Truck, CheckCircle, X
} from "lucide-react";
import * as React from "react";

const orders = [
  { id: "#ORD-12890", customer: "John Smith", product: "Wireless Headphones", qty: 2, amount: "$599.98", status: "New", date: "2026-02-20", tracking: "" },
  { id: "#ORD-12889", customer: "Sarah Johnson", product: "Smart Watch", qty: 1, amount: "$399.99", status: "New", date: "2026-02-20", tracking: "" },
  { id: "#ORD-12887", customer: "Mike Brown", product: "Bluetooth Speaker", qty: 1, amount: "$79.99", status: "Processing", date: "2026-02-19", tracking: "" },
  { id: "#ORD-12885", customer: "Emily Davis", product: "USB-C Hub", qty: 3, amount: "$119.97", status: "Processing", date: "2026-02-19", tracking: "" },
  { id: "#ORD-12880", customer: "David Wilson", product: "Gaming Mouse", qty: 1, amount: "$59.99", status: "Shipped", date: "2026-02-18", tracking: "TRK123456789" },
  { id: "#ORD-12875", customer: "Lisa Anderson", product: "Webcam 4K", qty: 2, amount: "$299.98", status: "Shipped", date: "2026-02-17", tracking: "TRK987654321" },
  { id: "#ORD-12870", customer: "Tom Martinez", product: "Keyboard", qty: 1, amount: "$129.99", status: "Delivered", date: "2026-02-15", tracking: "TRK456789123" },
  { id: "#ORD-12865", customer: "Anna Taylor", product: "Laptop Stand", qty: 1, amount: "$49.99", status: "Delivered", date: "2026-02-14", tracking: "TRK321654987" },
];

export function SellerOrderManagementPage() {
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showTrackingModal, setShowTrackingModal] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [trackingId, setTrackingId] = React.useState("");
  const [showOrderDetail, setShowOrderDetail] = React.useState(false);
  const [selectedOrders, setSelectedOrders] = React.useState<string[]>([]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" ? true : order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const openTrackingModal = (order: any) => {
    setSelectedOrder(order);
    setTrackingId(order.tracking);
    setShowTrackingModal(true);
  };

  const openOrderDetail = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const statusCounts = {
    new: orders.filter(o => o.status === "New").length,
    processing: orders.filter(o => o.status === "Processing").length,
    shipped: orders.filter(o => o.status === "Shipped").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h1>
            <p className="text-sm text-gray-700">Manage and fulfill customer orders</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
            <Download className="w-4 h-4" />
            <span>Export Orders</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border-2 border-gray-400 p-4">
          <p className="text-xs font-bold text-gray-700 uppercase mb-2">New Orders</p>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.new}</p>
          <p className="text-xs text-gray-600 mt-1">Need action</p>
        </div>
        <div className="bg-white border-2 border-gray-400 p-4">
          <p className="text-xs font-bold text-gray-700 uppercase mb-2">Processing</p>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.processing}</p>
          <p className="text-xs text-gray-600 mt-1">In progress</p>
        </div>
        <div className="bg-white border-2 border-gray-400 p-4">
          <p className="text-xs font-bold text-gray-700 uppercase mb-2">Shipped</p>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.shipped}</p>
          <p className="text-xs text-gray-600 mt-1">In transit</p>
        </div>
        <div className="bg-white border-2 border-gray-400 p-4">
          <p className="text-xs font-bold text-gray-700 uppercase mb-2">Delivered</p>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.delivered}</p>
          <p className="text-xs text-gray-600 mt-1">Completed</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border-2 border-gray-400 p-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Search */}
          <div className="flex-1 w-full md:w-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, customer, or product..."
              className="w-full px-4 py-2 pr-10 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`px-4 py-2 text-sm font-bold border-2 whitespace-nowrap ${
                selectedStatus === "all"
                  ? "border-gray-800 bg-gray-200"
                  : "border-gray-400 bg-white hover:bg-gray-100"
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setSelectedStatus("New")}
              className={`px-4 py-2 text-sm font-bold border-2 whitespace-nowrap ${
                selectedStatus === "New"
                  ? "border-gray-800 bg-gray-200"
                  : "border-gray-400 bg-white hover:bg-gray-100"
              }`}
            >
              New ({statusCounts.new})
            </button>
            <button
              onClick={() => setSelectedStatus("Processing")}
              className={`px-4 py-2 text-sm font-bold border-2 whitespace-nowrap ${
                selectedStatus === "Processing"
                  ? "border-gray-800 bg-gray-200"
                  : "border-gray-400 bg-white hover:bg-gray-100"
              }`}
            >
              Processing
            </button>
            <button
              onClick={() => setSelectedStatus("Shipped")}
              className={`px-4 py-2 text-sm font-bold border-2 whitespace-nowrap ${
                selectedStatus === "Shipped"
                  ? "border-gray-800 bg-gray-200"
                  : "border-gray-400 bg-white hover:bg-gray-100"
              }`}
            >
              Shipped
            </button>
            <button
              onClick={() => setSelectedStatus("Delivered")}
              className={`px-4 py-2 text-sm font-bold border-2 whitespace-nowrap ${
                selectedStatus === "Delivered"
                  ? "border-gray-800 bg-gray-200"
                  : "border-gray-400 bg-white hover:bg-gray-100"
              }`}
            >
              Delivered
            </button>
          </div>
        </div>

        {selectedOrders.length > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-gray-300 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">
              {selectedOrders.length} order(s) selected
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
                Mark as Processing
              </button>
              <button className="px-4 py-2 text-sm border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
                Print Invoices
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white border-2 border-gray-400 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-400 bg-gray-50">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  className="w-5 h-5 border-2 border-gray-400"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Product</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Qty</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Date</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b-2 border-gray-300 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleOrderSelection(order.id)}
                    className="w-5 h-5 border-2 border-gray-400"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openOrderDetail(order)}
                    className="font-bold text-gray-900 text-sm hover:underline"
                  >
                    {order.id}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900">{order.customer}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">{order.product}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">{order.qty}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-bold text-gray-900">{order.amount}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">{order.date}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-3 py-1 text-xs font-bold border-2 ${
                    order.status === "New" ? "border-gray-800 bg-gray-800 text-white" :
                    order.status === "Processing" ? "border-gray-600 bg-gray-600 text-white" :
                    order.status === "Shipped" ? "border-gray-400 bg-gray-400 text-white" :
                    "border-gray-400 bg-gray-200 text-gray-900"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openOrderDetail(order)}
                      className="p-2 border-2 border-gray-400 bg-white hover:bg-gray-100"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    {(order.status === "Processing" || order.status === "New") && (
                      <button
                        onClick={() => openTrackingModal(order)}
                        className="p-2 border-2 border-gray-400 bg-white hover:bg-gray-100"
                        title="Add Tracking"
                      >
                        <Truck className="w-4 h-4 text-gray-700" />
                      </button>
                    )}
                    <button
                      className="p-2 border-2 border-gray-400 bg-white hover:bg-gray-100"
                      title="Print Invoice"
                    >
                      <Printer className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Tracking Modal */}
      {showTrackingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-400 max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Add Tracking ID</h3>
              <button onClick={() => setShowTrackingModal(false)}>
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 border-2 border-gray-400 bg-gray-50">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-700">Order ID:</span>
                    <p className="font-bold text-gray-900">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-700">Customer:</span>
                    <p className="font-bold text-gray-900">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <span className="text-gray-700">Product:</span>
                    <p className="font-bold text-gray-900">{selectedOrder.product}</p>
                  </div>
                  <div>
                    <span className="text-gray-700">Amount:</span>
                    <p className="font-bold text-gray-900">{selectedOrder.amount}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Courier Service *
                </label>
                <select className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600">
                  <option value="">Select courier</option>
                  <option>FedEx</option>
                  <option>UPS</option>
                  <option>DHL</option>
                  <option>USPS</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Tracking ID *
                </label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTrackingModal(false)}
                className="flex-1 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold"
              >
                Cancel
              </button>
              <button className="flex-1 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                Update & Mark as Shipped
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border-2 border-gray-400 max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
              <button onClick={() => setShowOrderDetail(false)}>
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <div className="p-4 border-2 border-gray-400 bg-gray-50">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-700">Order ID:</span>
                    <p className="font-bold text-gray-900 text-lg">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-700">Order Date:</span>
                    <p className="font-bold text-gray-900">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <span className="text-gray-700">Status:</span>
                    <p className="font-bold text-gray-900">{selectedOrder.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-700">Total Amount:</span>
                    <p className="font-bold text-gray-900 text-lg">{selectedOrder.amount}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Customer Information</h4>
                <div className="p-4 border-2 border-gray-400 text-sm space-y-2">
                  <p><span className="text-gray-700">Name:</span> <span className="font-bold text-gray-900">{selectedOrder.customer}</span></p>
                  <p><span className="text-gray-700">Email:</span> <span className="text-gray-900">customer@example.com</span></p>
                  <p><span className="text-gray-700">Phone:</span> <span className="text-gray-900">+1 (555) 123-4567</span></p>
                  <p><span className="text-gray-700">Address:</span> <span className="text-gray-900">123 Main St, Apt 4B, New York, NY 10001</span></p>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Product Details</h4>
                <div className="p-4 border-2 border-gray-400">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-300 border-2 border-gray-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-600">IMG</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{selectedOrder.product}</p>
                      <p className="text-sm text-gray-700">Quantity: {selectedOrder.qty}</p>
                      <p className="text-sm text-gray-700">SKU: WH-001</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{selectedOrder.amount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking Info */}
              {selectedOrder.tracking && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Shipping Information</h4>
                  <div className="p-4 border-2 border-gray-400 bg-gray-50 text-sm space-y-2">
                    <p><span className="text-gray-700">Tracking ID:</span> <span className="font-bold text-gray-900">{selectedOrder.tracking}</span></p>
                    <p><span className="text-gray-700">Courier:</span> <span className="text-gray-900">FedEx</span></p>
                    <p><span className="text-gray-700">Shipped Date:</span> <span className="text-gray-900">{selectedOrder.date}</span></p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
                {selectedOrder.status !== "Delivered" && (
                  <button
                    onClick={() => {
                      setShowOrderDetail(false);
                      openTrackingModal(selectedOrder);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Update Shipment</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="bg-white border-2 border-gray-400 p-12 text-center mt-6">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No orders found</h3>
          <p className="text-sm text-gray-600">
            {searchQuery ? "Try adjusting your search or filters" : "Orders will appear here once customers place them"}
          </p>
        </div>
      )}
    </div>
  );
}