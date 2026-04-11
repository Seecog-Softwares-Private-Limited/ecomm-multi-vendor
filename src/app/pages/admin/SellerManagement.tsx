"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "../../components/Link";
import { Search, Filter, Eye, Ban, X, AlertTriangle, Unlock } from "lucide-react";

export type SellerRow = {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  kyc: string;
  products: number;
  orders: number;
  status: string;
};

type SellersResponse = {
  success: true;
  data: SellerRow[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

function kycBadgeClass(kyc: string): string {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  switch (kyc.toLowerCase()) {
    case "approved":
      return `${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20`;
    case "pending":
      return `${base} bg-amber-50 text-amber-700 ring-1 ring-amber-600/20`;
    case "rejected":
      return `${base} bg-rose-50 text-rose-700 ring-1 ring-rose-600/20`;
    default:
      return `${base} bg-slate-100 text-slate-600 ring-1 ring-slate-300/50`;
  }
}

function statusBadgeClass(status: string): string {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  switch (status.toLowerCase()) {
    case "active":
      return `${base} bg-blue-50 text-blue-700 ring-1 ring-blue-600/20`;
    case "blocked":
      return `${base} bg-rose-50 text-rose-700 ring-1 ring-rose-600/20`;
    default:
      return `${base} bg-slate-100 text-slate-600 ring-1 ring-slate-300/50`;
  }
}

export function SellerManagement() {
  const searchParamsHook = useSearchParams();
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [meta, setMeta] = useState<SellersResponse["meta"] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(() => searchParamsHook?.get("search") ?? "");
  const [searchInput, setSearchInput] = useState(() => searchParamsHook?.get("search") ?? "");
  const [kycStatus, setKycStatus] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [blockingSellerId, setBlockingSellerId] = useState<string | null>(null);
  const [blockError, setBlockError] = useState<string | null>(null);
  // Block-reason modal
  const [blockTarget, setBlockTarget] = useState<SellerRow | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [blockReasonError, setBlockReasonError] = useState("");
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  // Unblock confirmation modal
  const [unblockTarget, setUnblockTarget] = useState<SellerRow | null>(null);

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (kycStatus) params.set("kycStatus", kycStatus);
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("pageSize", "10");

    try {
      const res = await fetch(`/api/admin/sellers?${params.toString()}`, {
        credentials: "include",
      });
      const json = (await res.json()) as SellersResponse | { success: false; error: { message: string } };
      if (!res.ok || !("success" in json) || !json.success) {
        const msg = "error" in json ? json.error.message : "Failed to load sellers";
        setError(msg);
        setSellers([]);
        setMeta(undefined);
        return;
      }
      setSellers(json.data);
      setMeta(json.meta ?? undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sellers");
      setSellers([]);
      setMeta(undefined);
    } finally {
      setLoading(false);
    }
  }, [search, kycStatus, status, page]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleFilter = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const openBlockModal = (seller: SellerRow) => {
    if (seller.status.toLowerCase() === "blocked" || seller.status.toLowerCase() === "suspended") {
      // Show confirmation dialog before unblocking
      setUnblockTarget(seller);
      return;
    }
    setBlockTarget(seller);
    setBlockReason("");
    setBlockReasonError("");
    setTimeout(() => reasonRef.current?.focus(), 50);
  };

  const confirmBlock = async (seller: SellerRow, action: string, reason: string) => {
    setBlockError(null);
    setBlockTarget(null);
    setBlockingSellerId(seller.id);
    try {
      const res = await fetch(`/api/admin/sellers/${seller.id}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason || undefined }),
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBlockError(json?.error?.message ?? "Action failed");
        return;
      }
      fetchSellers();
    } catch (e) {
      setBlockError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBlockingSellerId(null);
    }
  };

  const handleModalConfirm = () => {
    if (!blockTarget) return;
    if (!blockReason.trim()) {
      setBlockReasonError("Please enter a reason for blocking this vendor.");
      reasonRef.current?.focus();
      return;
    }
    confirmBlock(blockTarget, "block", blockReason.trim());
    setBlockReason("");
    setBlockReasonError("");
  };

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 0;
  const pageSize = meta?.pageSize ?? 10;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="min-h-full bg-slate-50/80 p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Seller Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage all sellers and their accounts
        </p>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or business..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={kycStatus}
              onChange={(e) => {
                setKycStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All KYC Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
            <button
              type="button"
              onClick={handleFilter}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {(error || blockError) && (
          <div className="border-b border-slate-200 bg-rose-50/80 px-6 py-4 text-sm text-rose-700">
            {error ?? blockError}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Seller Name
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Business Name
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Phone
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      KYC Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Products
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Orders
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {sellers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-12 text-center text-sm text-slate-500"
                      >
                        No sellers found.
                      </td>
                    </tr>
                  ) : (
                    sellers.map((seller) => (
                      <tr
                        key={seller.id}
                        className="transition-colors hover:bg-slate-50/50"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                          {seller.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                          {seller.business}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {seller.email}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                          {seller.phone}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={kycBadgeClass(seller.kyc)}>
                            {seller.kyc}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                          {seller.products}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                          {seller.orders}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={statusBadgeClass(seller.status)}>
                            {seller.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/sellers/${seller.id}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <span title="View Details">
                                <Eye className="h-4 w-4" />
                              </span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => openBlockModal(seller)}
                              disabled={blockingSellerId === seller.id}
                              title={
                                seller.status.toLowerCase() === "blocked" || seller.status.toLowerCase() === "suspended"
                                  ? "Unblock Vendor"
                                  : "Block Vendor"
                              }
                              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors disabled:opacity-50 ${
                                seller.status.toLowerCase() === "blocked" || seller.status.toLowerCase() === "suspended"
                                  ? "hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                                  : "hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                              }`}
                            >
                              {blockingSellerId === seller.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                              ) : seller.status.toLowerCase() === "blocked" || seller.status.toLowerCase() === "suspended" ? (
                                <Unlock className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </button>
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
                Showing{" "}
                <span className="font-medium text-slate-700">{from}</span> to{" "}
                <span className="font-medium text-slate-700">{to}</span> of{" "}
                <span className="font-medium text-slate-700">{total}</span> sellers
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  if (p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Unblock confirmation modal */}
      {unblockTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setUnblockTarget(null); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <Unlock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Unblock Vendor</h3>
                  <p className="text-xs text-slate-500">{unblockTarget.name} · {unblockTarget.business}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUnblockTarget(null)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-slate-600">
                Are you sure you want to <span className="font-semibold text-emerald-600">unblock</span> this vendor?
              </p>
              <p className="mt-2 text-sm text-slate-500">
                They will regain access to their dashboard and will be able to list products and receive orders again.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setUnblockTarget(null)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = unblockTarget;
                  setUnblockTarget(null);
                  confirmBlock(target, "unblock", "");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <Unlock className="h-4 w-4" />
                Yes, Unblock Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block-reason modal */}
      {blockTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { setBlockTarget(null); } }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Block Vendor</h3>
                  <p className="text-xs text-slate-500">{blockTarget.name} · {blockTarget.business}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBlockTarget(null)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-slate-600">
                This vendor will be <span className="font-semibold text-rose-600">suspended</span> and
                will no longer be able to list products or receive orders. A reason is required.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Reason for blocking <span className="text-rose-500">*</span>
                </label>
                <textarea
                  ref={reasonRef}
                  rows={3}
                  value={blockReason}
                  onChange={(e) => { setBlockReason(e.target.value); if (blockReasonError) setBlockReasonError(""); }}
                  placeholder="e.g. Violated marketplace policies, fraudulent listings…"
                  className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                    blockReasonError
                      ? "border-rose-400 focus:border-rose-400 focus:ring-rose-500/20"
                      : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20"
                  }`}
                />
                {blockReasonError && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {blockReasonError}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setBlockTarget(null)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalConfirm}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                <Ban className="h-4 w-4" />
                Block Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
