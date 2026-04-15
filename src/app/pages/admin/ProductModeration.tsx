"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, CheckCircle, XCircle, Filter, Search, X, Trash2, RotateCcw } from "lucide-react";
import * as React from "react";

type ProductRow = {
  id: string;
  name: string;
  sellerName: string;
  categoryName: string;
  price: number;
  status: string;
  statusDisplay: string;
  edited?: boolean;
  rejectionReason?: string | null;
  submittedDate: string;
  /** When listing trash — ISO deleted time. */
  deletedAt?: string | null;
};

type ProductsResponse = {
  success: true;
  data: ProductRow[];
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

type CategoryItem = { id: string; slug: string; name: string };

type ProductDetail = {
  id: string;
  name: string;
  description: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  stock: number;
  status: string;
  statusDisplay: string;
  rejectionReason?: string | null;
  submittedDate: string;
  sellerName: string;
  categoryName: string;
  subCategoryName: string;
  images: { id: string; url: string; sortOrder: number }[];
  specifications: { key: string; value: string }[];
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function statusBadgeClass(status: string): string {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const s = status.toLowerCase();
  if (s.includes("trash")) return `${base} bg-rose-50 text-rose-800 ring-1 ring-rose-200`;
  if (s.includes("edited")) return `${base} bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20`;
  if (s === "pending" || s === "pending_approval") return `${base} bg-amber-50 text-amber-700 ring-1 ring-amber-600/20`;
  if (s === "approved" || s === "active") return `${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20`;
  if (s === "rejected") return `${base} bg-rose-50 text-rose-700 ring-1 ring-rose-600/20`;
  if (s === "draft" || s === "inactive") return `${base} bg-slate-100 text-slate-600 ring-1 ring-slate-300/50`;
  return `${base} bg-slate-100 text-slate-600 ring-1 ring-slate-300/50`;
}

/** Build image src: support absolute URLs (from upload API) or root-relative paths. */
function productImageSrc(url: string): string {
  if (!url) return "";
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return u;
  return `/${u.replace(/^\//, "")}`;
}

export function ProductModeration() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [meta, setMeta] = useState<ProductsResponse["meta"] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchInput, setSearchInput] = useState(() => searchParamsHook?.get("search") ?? "");
  const [search, setSearch] = useState(() => searchParamsHook?.get("search") ?? "");
  const [page, setPage] = useState(1);
  const [previewProduct, setPreviewProduct] = useState<ProductRow | null>(null);
  const [previewDetail, setPreviewDetail] = useState<ProductDetail | null>(null);
  const [previewDetailLoading, setPreviewDetailLoading] = useState(false);
  const [previewDetailError, setPreviewDetailError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectProduct, setRejectProduct] = useState<ProductRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [listView, setListView] = useState<"all" | "trash">("all");

  const fetchProducts = useCallback(async (pageOverride?: number) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (listView === "trash") {
      params.set("trash", "1");
    } else {
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
    }
    if (search) params.set("search", search);
    params.set("page", String(pageOverride ?? page));
    params.set("pageSize", "10");

    try {
      const res = await fetch(`/api/admin/products?${params.toString()}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json?.error?.message ?? "Failed to load products";
        setError(msg);
        setProducts([]);
        setMeta(undefined);
        if (res.status === 401 || (res.status === 403 && String(msg).toLowerCase().includes("admin"))) {
          router.replace(`/admin/login?callbackUrl=${encodeURIComponent("/admin/products")}`);
        }
        return;
      }
      setProducts(json.data ?? []);
      setMeta(json.meta ?? undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
      setProducts([]);
      setMeta(undefined);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search, page, router, listView]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories", { credentials: "include" });
      const json = await res.json();
      if (res.ok && json?.data) setCategories(Array.isArray(json.data) ? json.data : []);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!previewProduct) {
      setPreviewDetail(null);
      setPreviewDetailError(null);
      return;
    }
    let cancelled = false;
    setPreviewDetailLoading(true);
    setPreviewDetailError(null);
    fetch(`/api/admin/products/${previewProduct.id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.success && json?.data) {
          setPreviewDetail(json.data);
          setPreviewDetailError(null);
        } else {
          setPreviewDetailError(json?.error?.message ?? "Failed to load product details");
          setPreviewDetail(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewDetailError("Failed to load product details");
          setPreviewDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [previewProduct?.id]);

  const handleApplyFilters = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleApprove = async (product: ProductRow) => {
    setActionError(null);
    setActioningId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/approve`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json?.error?.message ?? "Approve failed");
        return;
      }
      // Optimistic update so price stays visible while refetch runs in background
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, status: "ACTIVE", statusDisplay: "Approved" }
            : p
        )
      );
      if (previewProduct?.id === product.id) setPreviewProduct(null);
      fetchProducts();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (product: ProductRow, reason?: string) => {
    setActionError(null);
    setActioningId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: reason ?? "" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json?.error?.message ?? "Reject failed");
        return;
      }
      setRejectProduct(null);
      setRejectReason("");
      fetchProducts();
      if (previewProduct?.id === product.id) setPreviewProduct(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setActioningId(null);
    }
  };

  const handleRestore = async (product: ProductRow) => {
    setActionError(null);
    setActioningId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/restore`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json?.error?.message ?? "Restore failed");
        return;
      }
      fetchProducts();
      if (previewProduct?.id === product.id) setPreviewProduct(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setActioningId(null);
    }
  };

  const handlePermanentDelete = async (product: ProductRow) => {
    if (
      !confirm(
        `Permanently delete "${product.name}"? This cannot be undone. (Blocked if the product was ever ordered.)`
      )
    )
      return;
    setActionError(null);
    setActioningId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/permanent`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json?.error?.message ?? "Permanent delete failed");
        return;
      }
      fetchProducts();
      if (previewProduct?.id === product.id) setPreviewProduct(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Permanent delete failed");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (product: ProductRow) => {
    if (
      !confirm(
        `Move "${product.name}" to trash? It will be hidden from the catalog until restored or permanently deleted.`
      )
    )
      return;
    setActionError(null);
    setActioningId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/delete`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json?.error?.message ?? "Delete failed");
        return;
      }
      fetchProducts();
      if (previewProduct?.id === product.id) setPreviewProduct(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setActioningId(null);
    }
  };

  const isPending = (p: ProductRow) =>
    p.status === "PENDING_APPROVAL" || p.statusDisplay.toLowerCase() === "pending";

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 0;
  const pageSize = meta?.pageSize ?? 10;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="min-h-full bg-slate-50/80 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Product Moderation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and approve products submitted by sellers
          </p>
        </div>
        <div className="inline-flex shrink-0 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setListView("all");
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              listView === "all"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => {
              setListView("trash");
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              listView === "trash"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Trash
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search product or seller..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              className="w-64 rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          {listView === "all" && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <button
            type="button"
            onClick={handleApplyFilters}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Filter className="h-4 w-4" />
            {listView === "trash" ? "Search" : "Apply Filters"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {(error || actionError) && (
          <div className="border-b border-slate-200 bg-rose-50/80 px-6 py-4 text-sm text-rose-700">
            {error ?? actionError}
          </div>
        )}
        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {loading && (
              <div className="flex items-center gap-2 border-b border-slate-100 bg-indigo-50/60 px-6 py-2 text-xs text-indigo-600">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                Refreshing…
              </div>
            )}
            <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 touch-pan-x sm:mx-0 sm:px-0">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Product Name
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Seller Name
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Price
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {listView === "trash" ? "Deleted" : "Submitted Date"}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{product.name}</span>
                            {product.edited && (
                              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-600/20">
                                Edited
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                          {product.sellerName}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {product.categoryName}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={statusBadgeClass(product.statusDisplay)}>
                            {product.statusDisplay}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                          {listView === "trash" && product.deletedAt
                            ? product.deletedAt.slice(0, 10)
                            : product.submittedDate}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewProduct(product)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {listView === "all" && isPending(product) && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(product)}
                                  disabled={actioningId === product.id}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                                  title="Approve"
                                >
                                  {actioningId === product.id ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setRejectProduct(product); setRejectReason(""); }}
                                  disabled={actioningId === product.id}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {listView === "all" && (
                              <button
                                type="button"
                                onClick={() => handleDelete(product)}
                                disabled={actioningId === product.id}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                title="Move to trash"
                              >
                                {actioningId === product.id ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            {listView === "trash" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRestore(product)}
                                  disabled={actioningId === product.id}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                                  title="Restore"
                                >
                                  {actioningId === product.id ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                                  ) : (
                                    <RotateCcw className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePermanentDelete(product)}
                                  disabled={actioningId === product.id}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                  title="Delete permanently"
                                >
                                  {actioningId === product.id ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 px-6 py-4 sm:flex-row">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{from}</span> to{" "}
                <span className="font-medium text-slate-700">{to}</span> of{" "}
                <span className="font-medium text-slate-700">{total}</span> products
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p =
                    totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  if (p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={page >= totalPages || totalPages === 0}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setPreviewProduct(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Product Preview</h3>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {previewDetailLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                </div>
              )}
              {previewDetailError && !previewDetailLoading && (
                <div className="px-6 py-8 text-center text-sm text-rose-600">{previewDetailError}</div>
              )}
              {previewDetail && !previewDetailLoading && (
                <div className="space-y-6 p-6">
                  {/* Product images */}
                  {previewDetail.images.length > 0 ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-500">Images</label>
                      <div className="flex gap-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                        {previewDetail.images.map((img) => (
                          <div
                            key={img.id}
                            className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={productImageSrc(img.url)}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-sm text-slate-400">
                      No images
                    </div>
                  )}

                  {/* Name & description */}
                  <div>
                    <label className="text-sm font-medium text-slate-500">Product Name</label>
                    <p className="mt-0.5 font-medium text-slate-900">{previewDetail.name}</p>
                  </div>
                  {previewDetail.description && (
                    <div>
                      <label className="text-sm font-medium text-slate-500">Description</label>
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">
                        {previewDetail.description}
                      </p>
                    </div>
                  )}

                  {/* Meta grid */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium text-slate-500">Seller</label>
                      <p className="mt-0.5 text-slate-900">{previewDetail.sellerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">Category</label>
                      <p className="mt-0.5 text-slate-900">{previewDetail.categoryName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">Sub-category</label>
                      <p className="mt-0.5 text-slate-900">{previewDetail.subCategoryName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">SKU</label>
                      <p className="mt-0.5 text-slate-900">{previewDetail.sku}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">Selling Price</label>
                      <p className="mt-0.5 font-semibold text-slate-900">
                        {formatCurrency(previewDetail.sellingPrice)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">MRP</label>
                      <p className="mt-0.5 text-slate-900">{formatCurrency(previewDetail.mrp)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">Stock</label>
                      <p className="mt-0.5 text-slate-900">{previewDetail.stock}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">Status</label>
                      <p className="mt-0.5">
                        <span className={statusBadgeClass(previewDetail.statusDisplay)}>
                          {previewDetail.statusDisplay}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">Submitted Date</label>
                      <p className="mt-0.5 text-slate-900">{previewDetail.submittedDate}</p>
                    </div>
                    {previewDetail.statusDisplay.toLowerCase() === "rejected" && previewDetail.rejectionReason && (
                      <div className="col-span-2 sm:col-span-3">
                        <label className="text-sm font-medium text-slate-500">Rejection reason</label>
                        <p className="mt-0.5 rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-2 text-sm text-rose-800">
                          {previewDetail.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Specifications */}
                  {previewDetail.specifications.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-slate-500">Specifications</label>
                      <dl className="mt-2 rounded-xl border border-slate-200 bg-slate-50/30 p-4">
                        {previewDetail.specifications.map((spec) => (
                          <div key={spec.key} className="flex justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
                            <dt className="text-sm text-slate-600">{spec.key}</dt>
                            <dd className="text-sm font-medium text-slate-900">{spec.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              )}
            </div>
            {previewProduct && (
              <div className="flex shrink-0 gap-3 border-t border-slate-200 p-6">
                <button
                  type="button"
                  onClick={() => setPreviewProduct(null)}
                  className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                {isPending(previewProduct) && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprove(previewProduct)}
                      disabled={actioningId === previewProduct.id}
                      className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRejectProduct(previewProduct); setRejectReason(""); setPreviewProduct(null); }}
                      disabled={actioningId === previewProduct.id}
                      className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject with reason modal */}
      {rejectProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setRejectProduct(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Reject product</h3>
              <button
                type="button"
                onClick={() => setRejectProduct(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-6">
              <p className="text-sm text-slate-600">
                Add a note or reason for rejection. The vendor will see this on their product list and when editing the product.
              </p>
              <p className="text-sm font-medium text-slate-700">{rejectProduct.name}</p>
              <label className="text-sm font-medium text-slate-700">Reason for rejection (optional but recommended)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Image quality is low, description is incomplete..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
            <div className="flex shrink-0 gap-3 border-t border-slate-200 p-6">
              <button
                type="button"
                onClick={() => setRejectProduct(null)}
                className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReject(rejectProduct, rejectReason)}
                disabled={actioningId === rejectProduct.id}
                className="flex-1 rounded-xl border border-rose-200 bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
              >
                {actioningId === rejectProduct.id ? "Rejecting…" : "Reject product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
