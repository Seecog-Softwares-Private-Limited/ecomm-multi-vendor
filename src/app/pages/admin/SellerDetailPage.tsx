"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "../../components/Link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Package,
  ShoppingBag,
  DollarSign,
  Star,
  FileText,
  Ban,
  CheckCircle,
} from "lucide-react";
import * as React from "react";

const TABS = ["Business Info", "KYC Documents", "Bank Details", "Products", "Orders"] as const;

type SellerDetail = {
  seller: {
    id: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone?: string;
    businessAddress?: string;
    gstNumber?: string;
    status: string;
    statusReason?: string;
    createdAt: string;
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    avgRating: number | null;
  };
  bank: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  } | null;
  documents: Array<{
    documentType: string;
    label: string;
    identifier?: string;
    fileUrl?: string;
    status: string;
  }>;
  vendorDocuments?: Array<{ documentName: string; documentUrl: string }>;
  products: Array<{
    id: string;
    name: string;
    categoryName: string;
    price: number;
    stock: number;
    status: string;
  }>;
  orders: Array<{
    id: string;
    displayId: string;
    customerName: string;
    amount: string;
    status: string;
    date: string;
  }>;
};

export type SellerDetailPageProps = {
  sellerId?: string;
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function statusBadge(status: string): string {
  const s = status.toLowerCase();
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  if (s === "active" || s === "approved" || s === "delivered")
    return `${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20`;
  if (s === "shipped" || s === "processing")
    return `${base} bg-blue-50 text-blue-700 ring-1 ring-blue-600/20`;
  if (s === "blocked" || s === "suspended" || s === "rejected")
    return `${base} bg-rose-50 text-rose-700 ring-1 ring-rose-600/20`;
  if (s === "pending" || s === "draft")
    return `${base} bg-amber-50 text-amber-700 ring-1 ring-amber-600/20`;
  return `${base} bg-slate-100 text-slate-600 ring-1 ring-slate-300/50`;
}

export function SellerDetailPage({ sellerId = "" }: SellerDetailPageProps) {
  const [data, setData] = useState<SellerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [blocking, setBlocking] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockAction, setBlockAction] = useState<"block" | "unblock">("block");

  const fetchDetail = useCallback(async () => {
    if (!sellerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? "Failed to load seller");
        setData(null);
        return;
      }
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load seller");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const openDocument = (fileUrl: string | undefined) => {
    if (!fileUrl) return;
    const url = fileUrl.startsWith("http")
      ? fileUrl
      : `${typeof window !== "undefined" ? window.location.origin : ""}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openBlockModal = (action: "block" | "unblock") => {
    setBlockAction(action);
    setBlockReason("");
    setBlockError(null);
    setShowBlockModal(true);
  };

  const handleBlockSubmit = async () => {
    if (!sellerId) return;
    const isBlocked = data?.seller.status === "SUSPENDED";
    const action = isBlocked ? "unblock" : "block";
    if (action === "block" && !blockReason.trim()) {
      setBlockError("Please provide a reason for blocking.");
      return;
    }
    setBlocking(true);
    setBlockError(null);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: blockReason.trim() || undefined,
        }),
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBlockError(json?.error?.message ?? "Action failed");
        return;
      }
      setShowBlockModal(false);
      fetchDetail();
    } catch (e) {
      setBlockError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <p className="text-rose-600">{error ?? "Seller not found."}</p>
        <Link href="/admin/sellers" className="mt-4 inline-block text-sm text-slate-600 hover:underline">
          Back to Sellers
        </Link>
      </div>
    );
  }

  const { seller, stats, bank, documents, products, orders } = data;
  const isBlocked = seller.status === "SUSPENDED";

  return (
    <div className="min-h-full bg-slate-50/80 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <Link
        href="/admin/sellers"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sellers
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{seller.businessName}</h1>
          <p className="mt-1 text-sm text-slate-500">Seller ID: #{seller.id.slice(0, 8)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/kyc/${sellerId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <CheckCircle className="h-4 w-4" />
            Review KYC
          </Link>
          <button
            type="button"
            onClick={() => openBlockModal(isBlocked ? "unblock" : "block")}
            disabled={blocking}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-60 ${
              isBlocked
                ? "border border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Ban className="h-4 w-4" />
            {blocking ? "…" : isBlocked ? "Unblock Seller" : "Block Seller"}
          </button>
        </div>
      </div>
      {seller.statusReason && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">Status reason</p>
          <p className="mt-1 text-sm text-amber-900">{seller.statusReason}</p>
        </div>
      )}
      {blockError && <p className="mb-4 text-sm text-rose-600">{blockError}</p>}

      {/* Block/Unblock modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {isBlocked ? "Unblock Seller" : "Block Seller"}
            </h3>
            {!isBlocked && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700">Reason (required)</label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Enter reason for blocking this vendor..."
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
            {blockError && <p className="mt-2 text-sm text-rose-600">{blockError}</p>}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowBlockModal(false); setBlockError(null); }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBlockSubmit}
                disabled={blocking || (!isBlocked && !blockReason.trim())}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {blocking ? "…" : isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={String(stats.totalProducts)}
          icon={Package}
          iconClass="bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20"
        />
        <StatCard
          label="Total Orders"
          value={String(stats.totalOrders)}
          icon={ShoppingBag}
          iconClass="bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20"
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          iconClass="bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20"
        />
        <StatCard
          label="Avg Rating"
          value={stats.avgRating != null ? `${Number(stats.avgRating).toFixed(1)}/5.0` : "—"}
          icon={Star}
          iconClass="bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
        />
      </div>

      {/* Tabs */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex border-b border-slate-200/80 bg-slate-50/50">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === i
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Business Info */}
          {activeTab === 0 && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <Field label="Business Name" value={seller.businessName} />
                <Field label="GST Number" value={seller.gstNumber?.trim() ? seller.gstNumber : "Not Provided"} />
                <Field label="Email" value={seller.email} icon={Mail} />
                <Field label="Business Address" value={seller.businessAddress ?? "—"} icon={MapPin} />
                <Field label="Registration Date" value={formatDate(seller.createdAt)} />
              </div>
              <div className="space-y-4">
                <Field label="Owner Name" value={seller.ownerName} />
                <Field label="Phone" value={seller.phone ?? "—"} icon={Phone} />
                <div>
                  <label className="text-sm font-medium text-slate-500">KYC Status</label>
                  <p className="mt-1">
                    <span className={statusBadge(seller.status)}>{seller.status}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* KYC Documents */}
          {activeTab === 1 && (
            <div className="space-y-4">
              {documents.length === 0 && (!data.vendorDocuments || data.vendorDocuments.length === 0) ? (
                <p className="text-slate-500">No KYC documents uploaded.</p>
              ) : (
                <>
                  {documents.map((doc) => (
                    <div
                      key={doc.documentType}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/30 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200/80">
                          <FileText className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{doc.label}</p>
                          <p className="text-sm text-slate-500">{doc.identifier ?? "—"}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openDocument(doc.fileUrl)}
                        disabled={!doc.fileUrl}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        View Document
                      </button>
                    </div>
                  ))}
                  {data.vendorDocuments?.map((vd) => (
                    <div
                      key={vd.documentName}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/30 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200/80">
                          <FileText className="h-5 w-5 text-slate-600" />
                        </div>
                        <p className="font-medium text-slate-900">{vd.documentName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openDocument(vd.documentUrl)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View Document
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Bank Details */}
          {activeTab === 2 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {bank ? (
                <>
                  <Field label="Bank Name" value={bank.bankName} />
                  <Field label="Account Holder Name" value={bank.accountHolderName} />
                  <Field label="Account Number" value={bank.accountNumber} />
                  <Field label="IFSC Code" value={bank.ifscCode} />
                </>
              ) : (
                <p className="text-slate-500">No bank details added.</p>
              )}
            </div>
          )}

          {/* Products */}
          {activeTab === 3 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Product Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No products yet.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{p.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{p.categoryName}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{p.stock}</td>
                        <td className="px-4 py-3">
                          <span className={statusBadge(p.status)}>{p.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Orders */}
          {activeTab === 4 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No orders yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{o.displayId}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{o.customerName}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{o.amount}</td>
                        <td className="px-4 py-3">
                          <span className={statusBadge(o.status)}>{o.status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{o.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-500">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </label>
      <p className="mt-1 text-slate-900">{value}</p>
    </div>
  );
}
