"use client";

import { Plus, Edit, Trash2 } from "lucide-react";
import * as React from "react";

const categories = [
  { id: 1, name: "Electronics", slug: "electronics", status: "Active", createdDate: "2025-01-15" },
  { id: 2, name: "Fashion", slug: "fashion", status: "Active", createdDate: "2025-01-16" },
  { id: 3, name: "Home & Living", slug: "home-living", status: "Active", createdDate: "2025-01-17" },
  { id: 4, name: "Sports", slug: "sports", status: "Active", createdDate: "2025-01-18" },
  { id: 5, name: "Beauty", slug: "beauty", status: "Inactive", createdDate: "2025-01-19" },
];

export function CategoriesManagement() {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-sm text-gray-700 mt-1">Manage product categories</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 flex items-center gap-2 font-bold"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white border-2 border-gray-400">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b-2 border-gray-400">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Created Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{category.slug}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-bold border-2 border-gray-400 bg-gray-200">
                      {category.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{category.createdDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 border-2 border-gray-400 hover:bg-gray-100">
                        <Edit className="w-4 h-4 text-gray-700" />
                      </button>
                      <button className="p-2 border-2 border-gray-400 hover:bg-gray-100">
                        <Trash2 className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-gray-400 max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="Enter category name"
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="category-slug"
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Status
                </label>
                <select className="w-full px-4 py-2 border-2 border-gray-400 bg-white focus:outline-none focus:border-gray-600 font-bold">
                  <option>Active</option>
                  <option>Inactive</option>
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
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
