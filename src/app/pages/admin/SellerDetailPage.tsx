"use client";

import { Link } from "../../components/Link";
import { ArrowLeft, Mail, Phone, MapPin, Package, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import * as React from "react";

const tabs = ["Business Info", "KYC Documents", "Bank Details", "Products", "Orders"];

export type SellerDetailPageProduct = { id: number; name: string; category: string; price: string; stock: number; status: string };
export type SellerDetailPageOrder = { id: string; customer: string; amount: string; status: string; date: string };

export type SellerDetailPageProps = {
  sellerId?: string;
  products?: SellerDetailPageProduct[];
  orders?: SellerDetailPageOrder[];
};

const defaultProducts: SellerDetailPageProduct[] = [
  { id: 1, name: "Wireless Headphones", category: "Electronics", price: "$99.99", stock: 145, status: "Active" },
  { id: 2, name: "Smart Watch", category: "Electronics", price: "$199.99", stock: 89, status: "Active" },
  { id: 3, name: "Phone Case", category: "Accessories", price: "$19.99", stock: 234, status: "Active" },
];

const defaultOrders: SellerDetailPageOrder[] = [
  { id: "#ORD-12345", customer: "John Doe", amount: "$299.99", status: "Delivered", date: "2026-02-18" },
  { id: "#ORD-12344", customer: "Jane Smith", amount: "$149.99", status: "Shipped", date: "2026-02-17" },
  { id: "#ORD-12343", customer: "Bob Johnson", amount: "$89.99", status: "Processing", date: "2026-02-16" },
];

export function SellerDetailPage({ sellerId = "", products = defaultProducts, orders = defaultOrders }: SellerDetailPageProps) {
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Back Button */}
      <Link href="/admin/sellers" className="inline-flex items-center gap-2 text-sm text-gray-900 hover:underline mb-6 font-bold">
        <ArrowLeft className="w-4 h-4" />
        Back to Sellers
      </Link>

      {/* Seller Header */}
      <div className="bg-white border-2 border-gray-400 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tech Store</h1>
            <p className="text-sm text-gray-700 mt-1 font-bold">Seller ID: #{sellerId}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/kyc/${sellerId}`}
              className="px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold"
            >
              Review KYC
            </Link>
            <button className="px-4 py-2 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold">
              Block Seller
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 border-2 border-gray-300 bg-gray-50">
            <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-bold">Total Products</p>
              <p className="text-xl font-bold text-gray-900">245</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border-2 border-gray-300 bg-gray-50">
            <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-bold">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">1,240</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border-2 border-gray-300 bg-gray-50">
            <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-bold">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">$124,500</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border-2 border-gray-300 bg-gray-50">
            <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-bold">Avg Rating</p>
              <p className="text-xl font-bold text-gray-900">4.7/5.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-2 border-gray-400">
        <div className="border-b-2 border-gray-400">
          <div className="flex gap-8 px-6">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`py-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === index
                    ? "border-gray-700 text-gray-900"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Business Info Tab */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-gray-700">Business Name</label>
                  <p className="mt-1 text-gray-900">Tech Store</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Owner Name</label>
                  <p className="mt-1 text-gray-900">John Smith</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="mt-1 text-gray-900">john@techstore.com</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </label>
                  <p className="mt-1 text-gray-900">+1 234 567 8901</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Business Address
                  </label>
                  <p className="mt-1 text-gray-900">123 Business Street, Suite 100, New York, NY 10001</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Registration Date</label>
                  <p className="mt-1 text-gray-900">January 15, 2025</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">KYC Status</label>
                  <span className="inline-flex mt-1 px-3 py-1 text-sm font-bold border-2 border-gray-400 bg-gray-200">
                    Approved
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* KYC Documents Tab */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border-2 border-gray-400">
                <div>
                  <p className="font-bold text-gray-900">PAN Card</p>
                  <p className="text-sm text-gray-700">ABCDE1234F</p>
                </div>
                <button className="px-4 py-2 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold">
                  View Document
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border-2 border-gray-400">
                <div>
                  <p className="font-bold text-gray-900">GST Certificate</p>
                  <p className="text-sm text-gray-700">22ABCDE1234F1Z5</p>
                </div>
                <button className="px-4 py-2 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold">
                  View Document
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border-2 border-gray-400">
                <div>
                  <p className="font-bold text-gray-900">Address Proof</p>
                  <p className="text-sm text-gray-700">Utility Bill</p>
                </div>
                <button className="px-4 py-2 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold">
                  View Document
                </button>
              </div>
            </div>
          )}

          {/* Bank Details Tab */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-gray-700">Bank Name</label>
                  <p className="mt-1 text-gray-900">Chase Bank</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Account Holder Name</label>
                  <p className="mt-1 text-gray-900">Tech Store LLC</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Account Number</label>
                  <p className="mt-1 text-gray-900">****  ****  ****  1234</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">IFSC Code</label>
                  <p className="mt-1 text-gray-900">CHAS0001234</p>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 3 && (
            <div className="overflow-x-auto border-2 border-gray-400">
              <table className="w-full">
                <thead className="bg-gray-200 border-b-2 border-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-400">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{product.category}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{product.price}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 4 && (
            <div className="overflow-x-auto border-2 border-gray-400">
              <table className="w-full">
                <thead className="bg-gray-200 border-b-2 border-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-400">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.customer}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{order.amount}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
