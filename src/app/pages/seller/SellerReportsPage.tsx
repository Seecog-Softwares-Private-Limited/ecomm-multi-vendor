"use client";

import { Download, TrendingUp, Calendar, DollarSign, ShoppingBag, Package } from "lucide-react";
import * as React from "react";

export function SellerReportsPage() {
  const [dateRange, setDateRange] = React.useState("last-30-days");

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sales Reports</h1>
            <p className="text-sm text-gray-700">Download and analyze your sales data</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600 font-bold"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last-7-days">Last 7 Days</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700 uppercase">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">₹89,345</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600">+15.2% vs last period</span>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700 uppercase">Total Orders</p>
            <ShoppingBag className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">1,247</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600">+8.4% vs last period</span>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700 uppercase">Products Sold</p>
            <Package className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">2,389</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600">+12.1% vs last period</span>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700 uppercase">Avg Order Value</p>
            <DollarSign className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">₹71.62</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600">+6.3% vs last period</span>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sales Report */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Sales Report</h3>
              <p className="text-sm text-gray-600">Detailed sales breakdown</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Download a comprehensive report of all sales including order details, revenue, taxes, and fees.
          </p>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
            <Download className="w-4 h-4" />
            <span>Download Sales Report</span>
          </button>
        </div>

        {/* Product Performance */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Product Performance</h3>
              <p className="text-sm text-gray-600">Best and worst sellers</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Analyze which products are performing well and which need attention with detailed metrics.
          </p>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
            <Download className="w-4 h-4" />
            <span>Download Product Report</span>
          </button>
        </div>

        {/* Order Report */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Order Report</h3>
              <p className="text-sm text-gray-600">Complete order history</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Export all orders with customer details, shipping information, and order status.
          </p>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
            <Download className="w-4 h-4" />
            <span>Download Order Report</span>
          </button>
        </div>

        {/* Inventory Report */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Inventory Report</h3>
              <p className="text-sm text-gray-600">Stock levels and alerts</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Get an overview of your inventory with stock levels, low stock alerts, and reorder suggestions.
          </p>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
            <Download className="w-4 h-4" />
            <span>Download Inventory Report</span>
          </button>
        </div>

        {/* Tax Report */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Tax Report</h3>
              <p className="text-sm text-gray-600">Tax summary for filing</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Download tax collected information organized by region for easy tax filing and compliance.
          </p>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
            <Download className="w-4 h-4" />
            <span>Download Tax Report</span>
          </button>
        </div>

        {/* Customer Report */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Customer Insights</h3>
              <p className="text-sm text-gray-600">Customer behavior analysis</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Understand your customers better with repeat purchase rates, lifetime value, and more.
          </p>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
            <Download className="w-4 h-4" />
            <span>Download Customer Report</span>
          </button>
        </div>
      </div>

      {/* Custom Report Builder */}
      <div className="mt-6 bg-white border-2 border-gray-400 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Custom Report Builder</h3>
        <p className="text-sm text-gray-700 mb-4">
          Create custom reports with specific date ranges and metrics tailored to your needs.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Start Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">End Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Report Type</label>
            <select className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600">
              <option>Sales</option>
              <option>Orders</option>
              <option>Products</option>
              <option>Inventory</option>
              <option>Tax</option>
              <option>Customers</option>
            </select>
          </div>
        </div>
        <button className="mt-4 w-full md:w-auto px-6 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
          Generate Custom Report
        </button>
      </div>
    </div>
  );
}
