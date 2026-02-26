"use client";

import { Link } from "../../components/Link";
import { Plus, Search, Edit, XCircle, Package } from "lucide-react";
import { Button, Input, Select, StatusBadge, EmptyState, Card } from "../components/UIComponents";
import { DataState } from "../../components/DataState";
import { useApi } from "@/lib/hooks/useApi";
import { vendorService } from "@/services/vendor.service";
import * as React from "react";

export function VendorProductsList() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const { data, error, isLoading, refetch } = useApi(() =>
    vendorService.getProducts()
  );
  const products = data ?? [];

  const handleDelete = React.useCallback(
    async (product: { id: string; name: string }) => {
      if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
      setDeletingId(product.id);
      try {
        await vendorService.deleteProduct(product.id);
        await refetch();
      } catch (err) {
        console.error("Delete product failed:", err);
        alert(err instanceof Error ? err.message : "Failed to delete product");
      } finally {
        setDeletingId(null);
      }
    },
    [refetch]
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || product.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <DataState
      isLoading={isLoading}
      error={error}
      retry={refetch}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Products</h1>
          <p className="text-[#64748B]">Manage your product catalog</p>
        </div>
        <Link href="/vendor/products/create">
          <Button variant="primary">
            <Plus className="w-5 h-5" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by product name or SKU..."
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
                { value: "all", label: "All Status" },
                { value: "draft", label: "Draft" },
                { value: "submitted", label: "Submitted" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Package className="w-12 h-12" />}
            title="No Products Found"
            description="You haven't added any products yet. Start by creating your first product."
            action={{
              label: "Add Your First Product",
              onClick: () => (window.location.href = "/vendor/products/create"),
            }}
          />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#E2E8F0]">
                  <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Product</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Category</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">SKU</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Price</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Stock</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Updated</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-[#64748B] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 relative w-12 h-12 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden">
                          {product.imageUrl ? (
                            <>
                              <img
                                src={product.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const fallback = e.currentTarget.nextElementSibling;
                                  if (fallback instanceof HTMLElement) fallback.classList.remove("hidden");
                                }}
                              />
                              <div className="hidden absolute inset-0 flex items-center justify-center text-[#94A3B8] bg-[#F8FAFC]">
                                <Package className="w-6 h-6" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <p className="font-semibold text-[#1E293B] line-clamp-2">{product.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-[#64748B]">{product.category}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-mono text-[#64748B]">{product.sku}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-bold text-[#1E293B]">₹{product.price}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {product.stock === 0 ? (
                        <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      ) : product.stock < 10 ? (
                        <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded">
                          {product.stock} left
                        </span>
                      ) : (
                        <span className="font-semibold text-[#1E293B]">{product.stock}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={product.status} size="sm" />
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-[#64748B]">{product.lastUpdated}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/vendor/products/edit/${product.id}`}>
                          <button className="p-2 text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product.id}
                          className="p-2 text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete product"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      </div>
    </DataState>
  );
}
