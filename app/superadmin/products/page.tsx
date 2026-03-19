"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, CheckCircle2, XCircle, Trash2 } from "lucide-react";

type ProductRow = {
  id: string;
  name: string;
  sellerName: string;
  categoryName: string;
  price: number;
  status: string;
  rejectionReason: string | null;
  submittedDate: string;
};

async function saFetch(path: string, init?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("superadmin_token") : null;
  const headers = new Headers(init?.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(path, { ...init, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Request failed");
  return json;
}

export default function SuperAdminProductsApprovalPage() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("PENDING_APPROVAL");

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (status) params.set("status", status === "PENDING_APPROVAL" ? "pending" : status.toLowerCase());
      const res = await saFetch(`/api/superadmin/products?${params.toString()}`);
      setItems(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const act = async (productId: string, action: "approve" | "reject" | "delete") => {
    const reason =
      action === "reject" ? prompt("Add a rejection reason (optional):")?.trim() : undefined;
    if (action === "delete" && !confirm("Delete this product?")) return;
    try {
      await saFetch(`/api/superadmin/products/${productId}/status`, {
        method: "PUT",
        body: JSON.stringify({ action, reason }),
      });
      toast.success("Updated product.");
      fetchList();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Approvals
          </h1>
          <p className="text-slate-600 mt-1">Approve, reject (with reason), or delete products.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name"
              className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 w-72 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
          >
            <option value="PENDING_APPROVAL">Pending</option>
            <option value="ACTIVE">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DRAFT">Draft</option>
          </select>
          <button
            type="button"
            onClick={fetchList}
            className="px-5 py-2.5 rounded-xl text-white font-semibold shadow-sm hover:shadow-md transition"
            style={{ background: "linear-gradient(135deg, #FF6A00 0%, #E55F00 55%, #16A34A 160%)" }}
          >
            Apply
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Seller</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 line-clamp-2">{p.name}</p>
                      <p className="text-xs text-slate-500">₹{p.price.toLocaleString("en-IN")} · {p.submittedDate}</p>
                      {p.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 line-clamp-2">{p.rejectionReason}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">{p.sellerName}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{p.categoryName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                        p.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : p.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {p.status === "PENDING_APPROVAL" ? "PENDING" : p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => act(p.id, "approve")}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 mr-2"
                        title="Approve"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => act(p.id, "reject")}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 mr-2"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => act(p.id, "delete")}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-slate-500" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

