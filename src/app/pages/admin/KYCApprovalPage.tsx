"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "../../components/Link";
import { ArrowLeft, FileText, CheckCircle, XCircle } from "lucide-react";
import * as React from "react";

const DOC_TYPE_LABELS: Record<string, string> = {
  PAN: "PAN Card",
  GST_CERTIFICATE: "GST Certificate",
  ADDRESS_PROOF: "Address Proof",
};

const DOC_TYPE_PLACEHOLDER: Record<string, string> = {
  PAN: "PAN Card",
  GST_CERTIFICATE: "GST Certificate",
  ADDRESS_PROOF: "Address Proof",
};

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url) || /image\//i.test(url);
}

export type KYCApprovalPageProps = {
  sellerId?: string;
};

type KycDoc = {
  id: string;
  documentType: string;
  identifier?: string;
  fileUrl?: string;
  status: string;
};

type SellerInfo = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  businessAddress?: string;
  status: string;
  gstNumber?: string;
};

type BankInfo = {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
};

type KycResponse = {
  seller: SellerInfo;
  bank: BankInfo | null;
  documents: KycDoc[];
};

export function KYCApprovalPage({ sellerId = "" }: KYCApprovalPageProps) {
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [data, setData] = useState<KycResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const fetchKyc = useCallback(async () => {
    if (!sellerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/kyc`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? "Failed to load KYC data");
        setData(null);
        return;
      }
      setData({
        seller: json.data.seller,
        bank: json.data.bank ?? null,
        documents: json.data.documents ?? [],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load KYC data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    fetchKyc();
  }, [fetchKyc]);

  const openDocument = (fileUrl: string | undefined) => {
    if (!fileUrl) return;
    const url = fileUrl.startsWith("http") ? fileUrl : `${typeof window !== "undefined" ? window.location.origin : ""}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRejectKyc = async () => {
    if (!sellerId) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError("Please enter a rejection reason.");
      return;
    }
    setRejecting(true);
    setRejectError(null);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/block`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setRejectError(json?.error?.message ?? "Failed to reject KYC");
        return;
      }
      setShowRejectModal(false);
      setRejectReason("");
      fetchKyc();
    } catch (e) {
      setRejectError(e instanceof Error ? e.message : "Failed to reject KYC");
    } finally {
      setRejecting(false);
    }
  };

  const handleApproveKyc = async () => {
    if (!sellerId) return;
    setApproving(true);
    setApproveError(null);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/kyc/approve`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setApproveError(json?.error?.message ?? "Failed to approve KYC");
        return;
      }
      setApproved(true);
      fetchKyc();
    } catch (e) {
      setApproveError(e instanceof Error ? e.message : "Failed to approve KYC");
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
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

  const { seller, bank, documents } = data;

  return (
    <div className="min-h-full bg-slate-50/80 p-6 lg:p-8">
      <Link
        href={`/admin/sellers/${sellerId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Seller Details
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">KYC Verification</h1>
          <p className="mt-1 text-sm text-slate-500">Review and approve seller KYC documents</p>
        </div>
        {approved || seller.status === "APPROVED" ? (
          <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-600/20">
            Approved
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 ring-1 ring-amber-600/20">
            Pending Review
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Seller Info */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Seller Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-500">Business Name</label>
              <p className="mt-0.5 text-slate-900">{seller.businessName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Owner Name</label>
              <p className="mt-0.5 text-slate-900">{seller.ownerName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Email</label>
              <p className="mt-0.5 text-slate-900">{seller.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Phone</label>
              <p className="mt-0.5 text-slate-900">{seller.phone ?? "—"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Business Address</label>
              <p className="mt-0.5 text-slate-900">{seller.businessAddress ?? "—"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">GST Number</label>
              <p className="mt-0.5 text-slate-900">{seller.gstNumber ?? "Not Provided"}</p>
            </div>
            {bank && (
              <>
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <label className="text-sm font-medium text-slate-500">Bank Details</label>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Bank Name</label>
                  <p className="mt-0.5 text-slate-900">{bank.bankName || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Account Holder Name</label>
                  <p className="mt-0.5 text-slate-900">{bank.accountHolderName || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Account Number</label>
                  <p className="mt-0.5 font-mono text-slate-900">{bank.accountNumber || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">IFSC Code</label>
                  <p className="mt-0.5 text-slate-900">{bank.ifscCode || "—"}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Actions</h2>
          {approveError && (
            <p className="mb-3 text-sm text-rose-600">{approveError}</p>
          )}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleApproveKyc}
              disabled={approving || approved || seller.status === "APPROVED"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {approving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Approving…
                </>
              ) : approved || seller.status === "APPROVED" ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  KYC Approved
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Approve KYC
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-slate-700 hover:bg-slate-50"
            >
              <XCircle className="h-5 w-5" />
              Reject KYC
            </button>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">KYC Documents</h2>
        {documents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-slate-500 shadow-sm">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => {
              const label = DOC_TYPE_LABELS[doc.documentType] ?? doc.documentType;
              const placeholder = DOC_TYPE_PLACEHOLDER[doc.documentType] ?? doc.documentType;
              const hasFile = !!doc.fileUrl;

              return (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{label}</h3>
                      <p className="text-sm text-slate-500">{doc.identifier ?? "—"}</p>
                    </div>
                  </div>
                  <div className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {hasFile && isImageUrl(doc.fileUrl!) ? (
                      <img
                        src={doc.fileUrl!}
                        alt={label}
                        className="h-full w-full object-contain"
                      />
                    ) : hasFile ? (
                      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                        <FileText className="mb-2 h-12 w-12 text-slate-400" />
                        <p className="text-sm font-medium text-slate-600">Document</p>
                        <p className="text-xs text-slate-400">{placeholder}</p>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                        <FileText className="mb-2 h-12 w-12 text-slate-300" />
                        <p className="text-sm text-slate-500">No file</p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openDocument(doc.fileUrl)}
                    disabled={!hasFile}
                    className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    View Full Document
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => { setShowRejectModal(false); setRejectReason(""); setRejectError(null); }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Reject KYC</h3>
            {rejectError && (
              <div className="mb-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
                {rejectError}
              </div>
            )}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Rejection Reason
              </label>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Enter reason for rejection..."
                disabled={rejecting}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowRejectModal(false); setRejectReason(""); setRejectError(null); }}
                disabled={rejecting}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectKyc}
                disabled={rejecting || !rejectReason.trim()}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                {rejecting ? "Rejecting…" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
