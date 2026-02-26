"use client";

import { Link } from "../../components/Link";
import { 
  ArrowLeft, Search, Filter, Download, Edit, 
  AlertTriangle, Package, Upload
} from "lucide-react";
import * as React from "react";

const products = [
  { id: 1, name: "Wireless Headphones Pro", sku: "WH-001", stock: 45, price: "$299.99", status: "Active", image: "HEADPHONES" },
  { id: 2, name: "Smart Watch Series 5", sku: "SW-045", stock: 8, price: "$399.99", status: "Active", image: "WATCH" },
  { id: 3, name: "Bluetooth Speaker", sku: "BS-023", stock: 3, price: "$79.99", status: "Active", image: "SPEAKER" },
  { id: 4, name: "Laptop Stand Aluminum", sku: "LS-012", stock: 67, price: "$49.99", status: "Active", image: "STAND" },
  { id: 5, name: "Gaming Mouse RGB", sku: "GM-089", stock: 0, price: "$59.99", status: "Out of Stock", image: "MOUSE" },
  { id: 6, name: "Mechanical Keyboard", sku: "MK-156", stock: 23, price: "$129.99", status: "Active", image: "KEYBOARD" },
  { id: 7, name: "Webcam 4K Pro", sku: "WC-078", stock: 5, price: "$149.99", status: "Active", image: "WEBCAM" },
  { id: 8, name: "USB-C Hub 7-in-1", sku: "UH-034", stock: 89, price: "$39.99", status: "Active", image: "HUB" },
];

export function InventoryManagementPage() {
  const [selectedFilter, setSelectedFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showBulkUpdate, setShowBulkUpdate] = React.useState(false);
  const [selectedProducts, setSelectedProducts] = React.useState<number[]>([]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      selectedFilter === "all" ? true :
      selectedFilter === "in-stock" ? product.stock > 20 :
      selectedFilter === "low-stock" ? product.stock > 0 && product.stock <= 20 :
      selectedFilter === "out-of-stock" ? product.stock === 0 :
      true;
    return matchesSearch && matchesFilter;
  });

  const toggleProductSelection = (id: number) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 20).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Inventory Management</h1>
            <p className="text-sm text-gray-700">Manage your product stock and pricing</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkUpdate(!showBulkUpdate)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Update</span>
            </button>
            <Link
              href="/seller/products/new"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold"
            >
              <Package className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border-2 border-gray-400 p-4">
          <p className="text-xs font-bold text-gray-700 uppercase mb-2">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white border-2 border-gray-400 p-4">
          <p className="text-xs font-bold text-gray-700 uppercase mb-2">In Stock</p>
          <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.stock > 20).length}</p>
        </div>
        <div className="bg-white border-2 border-gray-400 p-4">
          <p className="text-xs font-bold text-gray-700 uppercase mb-2">Low Stock</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
            {lowStockCount > 0 && <AlertTriangle className="w-5 h-5 text-gray-700" />}
          </div>
        </div>
        <div className="bg-white border-2 border-gray-400 p-4">
          <p className="text-xs font-bold text-gray-700 uppercase mb-2">Out of Stock</p>
          <p className="text-2xl font-bold text-gray-900">{outOfStockCount}</p>
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
              placeholder="Search by product name or SKU..."
              className="w-full px-4 py-2 pr-10 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2 text-sm font-bold border-2 whitespace-nowrap ${
                selectedFilter === "all"
                  ? "border-gray-800 bg-gray-200"
                  : "border-gray-400 bg-white hover:bg-gray-100"
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setSelectedFilter("in-stock")}
              className={`px-4 py-2 text-sm font-bold border-2 whitespace-nowrap ${
                selectedFilter === "in-stock"
                  ? "border-gray-800 bg-gray-200"
                  : "border-gray-400 bg-white hover:bg-gray-100"
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setSelectedFilter("low-stock")}
              className={`px-4 py-2 text-sm font-bold border-2 whitespace-nowrap ${
                selectedFilter === "low-stock"
                  ? "border-gray-800 bg-gray-200"
                  : "border-gray-400 bg-white hover:bg-gray-100"
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setSelectedFilter("out-of-stock")}
              className={`px-4 py-2 text-sm font-bold border-2 whitespace-nowrap ${
                selectedFilter === "out-of-stock"
                  ? "border-gray-800 bg-gray-200"
                  : "border-gray-400 bg-white hover:bg-gray-100"
              }`}
            >
              Out of Stock
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Export CSV</span>
          </button>
        </div>

        {selectedProducts.length > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-gray-300 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">
              {selectedProducts.length} product(s) selected
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
                Update Stock
              </button>
              <button className="px-4 py-2 text-sm border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
                Update Price
              </button>
              <button className="px-4 py-2 text-sm border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold">
                Deactivate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white border-2 border-gray-400 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-400 bg-gray-50">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 border-2 border-gray-400"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Product</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">SKU</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Price</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b-2 border-gray-300 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="w-5 h-5 border-2 border-gray-400"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-600">IMG</span>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">{product.sku}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={product.stock}
                      onChange={(e) => {
                        // Handle stock update
                      }}
                      className="w-20 px-2 py-1 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600 text-sm"
                    />
                    {product.stock <= 20 && product.stock > 0 && (
                      <span className="px-2 py-1 bg-gray-800 border border-gray-900 text-white text-xs font-bold">
                        LOW
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="px-2 py-1 bg-gray-400 border border-gray-500 text-white text-xs font-bold">
                        OUT
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-bold text-gray-900">{product.price}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-3 py-1 text-xs font-bold border-2 ${
                    product.status === "Active" ? "border-gray-400 bg-gray-200" : "border-gray-400 bg-gray-100"
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="p-2 border-2 border-gray-400 bg-white hover:bg-gray-100">
                    <Edit className="w-4 h-4 text-gray-700" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Update Modal */}
      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-400 max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bulk Update via CSV</h3>
            
            <div className="space-y-4">
              <div className="p-4 border-2 border-gray-400 bg-gray-50">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-bold">Step 1:</span> Download current inventory template
                </p>
                <button className="w-full py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold text-sm">
                  Download Template CSV
                </button>
              </div>

              <div className="p-4 border-2 border-gray-400 bg-gray-50">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-bold">Step 2:</span> Edit the CSV file with updated values
                </p>
                <p className="text-xs text-gray-600">Update stock, price, or other fields</p>
              </div>

              <div className="p-4 border-2 border-gray-400 bg-gray-50">
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-bold">Step 3:</span> Upload updated CSV file
                </p>
                <div className="border-2 border-dashed border-gray-400 p-8 text-center cursor-pointer hover:bg-gray-100">
                  <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900">Click to upload CSV</p>
                  <p className="text-xs text-gray-600 mt-1">or drag and drop</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBulkUpdate(false)}
                className="flex-1 py-2 border-2 border-gray-400 bg-white hover:bg-gray-100 font-bold"
              >
                Cancel
              </button>
              <button className="flex-1 py-2 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold">
                Upload & Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="bg-white border-2 border-gray-400 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-sm text-gray-600 mb-6">
            {searchQuery ? "Try adjusting your search or filters" : "Start by adding your first product"}
          </p>
          {!searchQuery && (
            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold"
            >
              <Package className="w-5 h-5" />
              <span>Add Your First Product</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}