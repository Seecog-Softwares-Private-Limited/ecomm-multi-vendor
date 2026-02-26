"use client";

import { Eye, CheckCircle, XCircle, Filter } from "lucide-react";
import * as React from "react";

const products = [
  { id: 1, name: "Wireless Headphones Pro", seller: "Tech Store", category: "Electronics", price: "$299.99", status: "Pending", submittedDate: "2026-02-18" },
  { id: 2, name: "Smart Watch Series 5", seller: "Tech Store", category: "Electronics", price: "$399.99", status: "Approved", submittedDate: "2026-02-17" },
  { id: 3, name: "Designer Handbag", seller: "Fashion Hub", category: "Fashion", price: "$499.99", status: "Pending", submittedDate: "2026-02-18" },
  { id: 4, name: "Yoga Mat Premium", seller: "Sports Gear", category: "Sports", price: "$49.99", status: "Rejected", submittedDate: "2026-02-16" },
  { id: 5, name: "LED Desk Lamp", seller: "Home Decor", category: "Home", price: "$79.99", status: "Pending", submittedDate: "2026-02-17" },
  { id: 6, name: "Running Shoes", seller: "Sports Gear", category: "Sports", price: "$129.99", status: "Approved", submittedDate: "2026-02-15" },
];

export function ProductModeration() {
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Product Moderation</h1>
        <p className="text-sm text-gray-700 mt-1">Review and approve products submitted by sellers</p>
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

          <select className="px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600 font-bold">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Fashion</option>
            <option>Sports</option>
            <option>Home</option>
          </select>

          <button className="px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 flex items-center gap-2 font-bold">
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border-2 border-gray-400">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b-2 border-gray-400">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Seller Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Submitted Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{product.seller}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{product.category}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{product.price}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{product.submittedDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowPreviewModal(true)}
                        className="p-2 border-2 border-gray-400 hover:bg-gray-100"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-gray-700" />
                      </button>
                      {product.status === 'Pending' && (
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
          <p className="text-sm text-gray-700 font-bold">Showing 1 to 6 of 125 products</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">Previous</button>
            <button className="px-3 py-1 bg-gray-700 text-white border-2 border-gray-800 text-sm font-bold">1</button>
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">2</button>
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">3</button>
            <button className="px-3 py-1 border-2 border-gray-400 hover:bg-gray-100 text-sm font-bold">Next</button>
          </div>
        </div>
      </div>

      {/* Product Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-400 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Product Preview</h3>
            
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
                <p className="text-gray-600 font-bold">PRODUCT IMAGE</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">Product Name</label>
                  <p className="mt-1 text-gray-900">Wireless Headphones Pro</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Category</label>
                  <p className="mt-1 text-gray-900">Electronics</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Price</label>
                  <p className="mt-1 text-gray-900">$299.99</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Stock</label>
                  <p className="mt-1 text-gray-900">150 units</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700">Description</label>
                  <p className="mt-1 text-gray-900">Premium wireless headphones with active noise cancellation and 30-hour battery life.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="flex-1 py-2 border-2 border-gray-400 text-gray-900 hover:bg-gray-100 font-bold"
              >
                Close
              </button>
              <button className="flex-1 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                Approve
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
