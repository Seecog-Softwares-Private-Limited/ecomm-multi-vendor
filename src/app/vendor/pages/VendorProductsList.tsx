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
      <div className="space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold leading-snug text-[#1E293B] sm:text-2xl lg:text-3xl">Products</h1>
            <p className="text-sm leading-relaxed text-[#64748B]">Manage your product catalog</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="inline-flex w-full rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-sm sm:w-auto">
              <button
                type="button"
                onClick={() => setListTab("active")}
                className={`min-h-11 flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-initial sm:min-h-0 ${
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
                className={`min-h-11 flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-initial sm:min-h-0 ${
                  listTab === "trash"
                    ? "bg-[#3B82F6] text-white shadow"
                    : "text-[#64748B] hover:bg-slate-50"
                }`}
              >
                Trash
              </button>
            </div>
            {listTab === "active" && (
              <Link href="/vendor/products/create" className="w-full sm:w-auto">
                <Button variant="primary" className="min-h-11 w-full sm:w-auto">
                  <Plus className="h-5 w-5" />
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
        <>
          <div className="space-y-3 md:hidden">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/40"
              >
                <div className="flex gap-3 border-b border-slate-100 p-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                    {product.imageUrl ? (
                      <>
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback instanceof HTMLElement) fallback.classList.remove("hidden");
                          }}
                        />
                        <div className="absolute inset-0 hidden flex items-center justify-center bg-[#F8FAFC] text-[#94A3B8]">
                          <Package className="h-7 w-7" />
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#94A3B8]">
                        <Package className="h-7 w-7" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold leading-snug text-[#1E293B]">{product.name}</p>
                    <p className="mt-1 break-words text-sm text-[#64748B]">{product.category}</p>
                    <p className="mt-0.5 font-mono text-xs text-[#94A3B8]">SKU: {product.sku}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-[#94A3B8]">Price</p>
                    <p className="font-bold text-[#1E293B]">₹{product.price}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#94A3B8]">Stock</p>
                    {product.stock === 0 ? (
                      <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                        Out of Stock
                      </span>
                    ) : product.stock < 10 ? (
                      <span className="inline-block rounded bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                        {product.stock} left
                      </span>
                    ) : (
                      <span className="font-semibold text-[#1E293B]">{product.stock}</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-[#94A3B8]">Status</p>
                    <div className="mt-1 flex flex-col items-start gap-1">
                      <StatusBadge status={product.status} size="sm" />
                      {product.status === "rejected" && product.rejectionReason && (
                        <p
                          className="rounded bg-rose-50 px-2 py-1 text-xs leading-relaxed text-rose-600"
                          title={product.rejectionReason}
                        >
                          {product.rejectionReason.length > 120
                            ? `${product.rejectionReason.slice(0, 120)}…`
                            : product.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-[#64748B]">
                    {listTab === "trash" && product.deletedAt
                      ? `Deleted: ${product.deletedAt.slice(0, 10)}`
                      : `Updated: ${product.lastUpdated}`}
                  </div>
                </div>
                <div className="flex flex-col gap-2 border-t border-slate-100 p-4 sm:flex-row">
                  {listTab === "active" ? (
                    <>
                      <Link href={`/vendor/products/edit/${product.id}`} className="flex-1">
                        <span className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#3B82F6] bg-white text-sm font-semibold text-[#3B82F6] transition hover:bg-blue-50">
                          <Edit className="h-4 w-4" />
                          Edit
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="min-h-11 flex-1 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Move to trash
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRestore(product)}
                        disabled={deletingId === product.id}
                        className="min-h-11 flex-1 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePermanentDelete(product)}
                        disabled={deletingId === product.id}
                        className="min-h-11 flex-1 rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete forever
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Card className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b-2 border-[#E2E8F0]">
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase text-[#64748B]">Product</th>
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase text-[#64748B]">Category</th>
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase text-[#64748B]">SKU</th>
                    <th className="px-4 py-4 text-right text-sm font-bold uppercase text-[#64748B]">Price</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase text-[#64748B]">Stock</th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase text-[#64748B]">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-bold uppercase text-[#64748B]">
                      {listTab === "trash" ? "Deleted" : "Updated"}
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-bold uppercase text-[#64748B]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-[#E2E8F0] transition-colors hover:bg-[#F8FAFC]">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                            {product.imageUrl ? (
                              <>
                                <img
                                  src={product.imageUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    const fallback = e.currentTarget.nextElementSibling;
                                    if (fallback instanceof HTMLElement) fallback.classList.remove("hidden");
                                  }}
                                />
                                <div className="absolute inset-0 hidden items-center justify-center bg-[#F8FAFC] text-[#94A3B8]">
                                  <Package className="h-6 w-6" />
                                </div>
                              </>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[#94A3B8]">
                                <Package className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <p className="line-clamp-2 font-semibold text-[#1E293B]">{product.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-[#64748B]">{product.category}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-mono text-sm text-[#64748B]">{product.sku}</p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p className="font-bold text-[#1E293B]">₹{product.price}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {product.stock === 0 ? (
                          <span className="inline-block rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                            Out of Stock
                          </span>
                        ) : product.stock < 10 ? (
                          <span className="inline-block rounded bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">
                            {product.stock} left
                          </span>
                        ) : (
                          <span className="font-semibold text-[#1E293B]">{product.stock}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <StatusBadge status={product.status} size="sm" />
                          {product.status === "rejected" && product.rejectionReason && (
                            <p
                              className="mt-1 max-w-[200px] rounded bg-rose-50 px-2 py-1 text-left text-xs text-rose-600"
                              title={product.rejectionReason}
                            >
                              {product.rejectionReason.length > 60
                                ? `${product.rejectionReason.slice(0, 60)}…`
                                : product.rejectionReason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-[#64748B]">
                          {listTab === "trash" && product.deletedAt
                            ? product.deletedAt.slice(0, 10)
                            : product.lastUpdated}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {listTab === "active" ? (
                            <>
                              <Link href={`/vendor/products/edit/${product.id}`}>
                                <button
                                  type="button"
                                  className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 text-[#3B82F6] transition-colors hover:bg-blue-50"
                                  aria-label="Edit product"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(product)}
                                disabled={deletingId === product.id}
                                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 text-[#DC2626] transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Move to trash"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRestore(product)}
                                disabled={deletingId === product.id}
                                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                                title="Restore product"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePermanentDelete(product)}
                                disabled={deletingId === product.id}
                                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 text-[#DC2626] transition-colors hover:bg-red-50 disabled:opacity-50"
                                title="Delete permanently"
                              >
                                <Trash2 className="h-4 w-4" />
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
        </>
      )}
      </div>
    </DataState>
  );
}
