"use client";

import { Link } from "../../components/Link";
import { Plus, Search, Edit, XCircle, Package, RotateCcw, Trash2 } from "lucide-react";
import { Button, Input, Select, StatusBadge, EmptyState, Card } from "../components/UIComponents";
import { DataState } from "../../components/DataState";
import { useApi } from "@/lib/hooks/useApi";
import { vendorService } from "@/services/vendor.service";
import * as React from "react";

export function VendorProductsList() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [listTab, setListTab] = React.useState<"active" | "trash">("active");

  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const { data, error, isLoading, refetch } = useApi(() =>
    vendorService.getProducts({ trash: listTab === "trash" })
  );
  const products = data ?? [];

  React.useEffect(() => {
    void refetch();
  }, [listTab, refetch]);

  const handleDelete = React.useCallback(
    async (product: { id: string; name: string }) => {
      if (
        !window.confirm(
          `Move "${product.name}" to trash? You can restore it later from the Trash tab.`
        )
      )
        return;
      setDeletingId(product.id);
      try {
        await vendorService.deleteProduct(product.id);
        await refetch();
      } catch (err) {
        console.error("Delete product failed:", err);
        alert(err instanceof Error ? err.message : "Failed to move product to trash");
      } finally {
        setDeletingId(null);
      }
    },
    [refetch]
  );

  const handleRestore = React.useCallback(
    async (product: { id: string; name: string }) => {
      setDeletingId(product.id);
      try {
        await vendorService.restoreProduct(product.id);
        await refetch();
      } catch (err) {
        console.error("Restore failed:", err);
        alert(err instanceof Error ? err.message : "Failed to restore product");
      } finally {
        setDeletingId(null);
      }
    },
    [refetch]
  );

  const handlePermanentDelete = React.useCallback(
    async (product: { id: string; name: string }) => {
      if (
        !window.confirm(
          `Permanently delete "${product.name}"? This cannot be undone. (Not allowed if the product was ever ordered.)`
        )
      )
        return;
      setDeletingId(product.id);
      try {
        await vendorService.permanentlyDeleteProduct(product.id);
        await refetch();
      } catch (err) {
        console.error("Permanent delete failed:", err);
        alert(err instanceof Error ? err.message : "Failed to permanently delete");
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
    if (listTab === "trash") return matchesSearch;
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Products</h1>
          <p className="text-[#64748B]">Manage your product catalog</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setListTab("active")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                listTab === "active"
                  ? "bg-[#3B82F6] text-white shadow"
                  : "text-[#64748B] hover:bg-slate-50"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setListTab("trash")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                listTab === "trash"
                  ? "bg-[#3B82F6] text-white shadow"
                  : "text-[#64748B] hover:bg-slate-50"
              }`}
            >
              Trash
            </button>
          </div>
          {listTab === "active" && (
            <Link href="/vendor/products/create">
              <Button variant="primary">
                <Plus className="w-5 h-5" />
                Add Product
              </Button>
            </Link>
          )}
        </div>
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
          {listTab === "active" && (
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
          )}
        </div>
      </Card>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Package className="w-12 h-12" />}
            title={listTab === "trash" ? "Trash is empty" : "No Products Found"}
            description={
              listTab === "trash"
                ? "Deleted products appear here. You can restore them or remove them permanently."
                : "You haven't added any products yet. Start by creating your first product."
            }
            action={
              listTab === "active"
                ? {
                    label: "Add Your First Product",
                    onClick: () => (window.location.href = "/vendor/products/create"),
                  }
                : undefined
            }
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
                  <th className="text-left py-4 px-4 text-sm font-bold text-[#64748B] uppercase">
                    {listTab === "trash" ? "Deleted" : "Updated"}
                  </th>
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
                      <div className="flex flex-col items-center gap-1">
                        <StatusBadge status={product.status} size="sm" />
                        {product.status === "rejected" && product.rejectionReason && (
                          <p className="max-w-[200px] text-left text-xs text-rose-600 bg-rose-50 rounded px-2 py-1 mt-1" title={product.rejectionReason}>
                            {product.rejectionReason.length > 60 ? `${product.rejectionReason.slice(0, 60)}…` : product.rejectionReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-[#64748B]">
                        {listTab === "trash" && product.deletedAt
                          ? product.deletedAt.slice(0, 10)
                          : product.lastUpdated}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {listTab === "active" ? (
                          <>
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
                              title="Move to trash"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRestore(product)}
                              disabled={deletingId === product.id}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Restore product"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePermanentDelete(product)}
                              disabled={deletingId === product.id}
                              className="p-2 text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </Card>
      )}
      </div>
    </DataState>
  );
}
