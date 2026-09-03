"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Search, TicketPercent, Trash2 } from "lucide-react";

export type CouponRow = {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  validFrom: string;
  validTo: string;
  maxUses: number | null;
  usedCount: number;
  status: "Active" | "Inactive";
  lifecycleStatus: "Active" | "Scheduled" | "Expired" | "Exhausted" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

type FormState = {
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: string;
  validFrom: string;
  validTo: string;
  maxUses: string;
  status: "Active" | "Inactive";
};

const emptyForm: FormState = {
  code: "",
  discountType: "PERCENT",
  discountValue: "",
  validFrom: "",
  validTo: "",
  maxUses: "",
  status: "Active",
};

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(local: string): string {
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function formatDiscount(row: CouponRow): string {
  if (row.discountType === "PERCENT") return `${row.discountValue}%`;
  return `₹${row.discountValue}`;
}

function formatValidity(row: CouponRow): string {
  const from = new Date(row.validFrom);
  const to = new Date(row.validTo);
  const fmt = (d: Date) =>
    Number.isNaN(d.getTime())
      ? "—"
      : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  return `${fmt(from)} → ${fmt(to)}`;
}

function formatUsage(row: CouponRow): string {
  const used = row.usedCount ?? 0;
  if (row.maxUses == null) return `${used} / Unlimited`;
  return `${used} / ${row.maxUses}`;
}

function statusBadgeClass(status: CouponRow["lifecycleStatus"]): string {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  switch (status) {
    case "Active":
      return `${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20`;
    case "Scheduled":
      return `${base} bg-sky-50 text-sky-700 ring-1 ring-sky-600/20`;
    case "Expired":
      return `${base} bg-slate-100 text-slate-600 ring-1 ring-slate-300/50`;
    case "Exhausted":
      return `${base} bg-amber-50 text-amber-800 ring-1 ring-amber-600/20`;
    case "Inactive":
      return `${base} bg-slate-100 text-slate-500 ring-1 ring-slate-300/50`;
    default:
      return `${base} bg-slate-100 text-slate-600 ring-1 ring-slate-300/50`;
  }
}

export function CouponsManagement() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [usedCountReadonly, setUsedCountReadonly] = useState(0);

  const load = useCallback(async (q?: string) => {
    setMessage(null);
    const params = new URLSearchParams();
    const query = (q ?? "").trim();
    if (query) params.set("q", query);
    const res = await fetch(`/api/admin/coupons${params.toString() ? `?${params}` : ""}`, {
      credentials: "include",
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      data?: { coupons?: CouponRow[] };
      error?: { message?: string };
    };
    if (res.status === 401 || res.status === 403) {
      router.replace(`/admin/login?callbackUrl=${encodeURIComponent("/admin/coupons")}`);
      setCoupons([]);
      return;
    }
    if (!res.ok || !json?.success) {
      setMessage({ type: "error", text: json?.error?.message ?? `Could not load (${res.status})` });
      setCoupons([]);
      return;
    }
    setCoupons(Array.isArray(json.data?.coupons) ? json.data!.coupons! : []);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const filteredHint = useMemo(() => {
    if (!search.trim()) return null;
    return `Showing results for “${search.trim()}”`;
  }, [search]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setUsedCountReadonly(0);
    setShowForm(true);
    setMessage(null);
  }

  function startEdit(row: CouponRow) {
    setEditingId(row.id);
    setForm({
      code: row.code,
      discountType: row.discountType,
      discountValue: String(row.discountValue),
      validFrom: toDatetimeLocalValue(row.validFrom),
      validTo: toDatetimeLocalValue(row.validTo),
      maxUses: row.maxUses == null ? "" : String(row.maxUses),
      status: row.deletedAt ? "Inactive" : row.status,
    });
    setUsedCountReadonly(row.usedCount ?? 0);
    setShowForm(true);
    setMessage(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: form.discountValue === "" ? null : Number(form.discountValue),
        validFrom: fromDatetimeLocalValue(form.validFrom),
        validTo: fromDatetimeLocalValue(form.validTo),
        maxUses: form.maxUses.trim() === "" ? null : form.maxUses.trim(),
        status: form.status,
      };
      if (!payload.validFrom || !payload.validTo) {
        setMessage({ type: "error", text: "Valid from and valid to dates are required." });
        return;
      }
      const url = editingId
        ? `/api/admin/coupons/${encodeURIComponent(editingId)}`
        : "/api/admin/coupons";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = json?.error?.details;
        const fields = details?.fields ?? details;
        const fieldMsg =
          typeof fields === "string"
            ? fields
            : fields && typeof fields === "object"
              ? (Object.values(fields as Record<string, string>).find(
                  (v) => typeof v === "string" && v.trim()
                ) as string | undefined)
              : undefined;
        setMessage({
          type: "error",
          text: fieldMsg || json?.error?.message || "Save failed",
        });
        return;
      }
      setMessage({ type: "success", text: editingId ? "Coupon updated." : "Coupon created." });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await load(search);
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  async function setActive(row: CouponRow, active: boolean) {
    setMessage(null);
    const res = await fetch(`/api/admin/coupons/${encodeURIComponent(row.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        code: row.code,
        discountType: row.discountType,
        discountValue: row.discountValue,
        validFrom: row.validFrom,
        validTo: row.validTo,
        maxUses: row.maxUses,
        status: active ? "Active" : "Inactive",
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage({ type: "error", text: json?.error?.message ?? "Could not update status" });
      return;
    }
    setMessage({ type: "success", text: active ? "Coupon enabled." : "Coupon disabled." });
    await load(search);
  }

  async function handleSoftDelete(row: CouponRow) {
    const ok = confirm(
      "Disable coupon?\nThis coupon will no longer be available to customers.\nExisting orders using this coupon will remain unchanged."
    );
    if (!ok) return;
    setMessage(null);
    const res = await fetch(`/api/admin/coupons/${encodeURIComponent(row.id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage({ type: "error", text: json?.error?.message ?? "Could not disable coupon" });
      return;
    }
    setMessage({ type: "success", text: "Coupon disabled." });
    if (editingId === row.id) {
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    }
    await load(search);
  }

  async function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await load(search);
    setLoading(false);
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TicketPercent className="h-7 w-7 text-amber-600" />
            Coupons
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Create and manage discount codes for checkout. Soft-disabled coupons stay linked to past
            orders.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" />
          Add coupon
        </button>
      </div>

      <form onSubmit={onSearchSubmit} className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm"
            placeholder="Search by coupon code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Search
        </button>
      </form>
      {filteredHint && <p className="mb-3 text-xs text-slate-500">{filteredHint}</p>}

      {message && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSave}
          className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit coupon" : "New coupon"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">Coupon code</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                required
                maxLength={50}
                placeholder="SAVE10"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Discount type</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.discountType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    discountType: e.target.value === "FIXED" ? "FIXED" : "PERCENT",
                  }))
                }
              >
                <option value="PERCENT">Percentage</option>
                <option value="FIXED">Fixed amount (INR)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">
                Discount value {form.discountType === "PERCENT" ? "(%)" : "(₹)"}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Valid from</span>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.validFrom}
                onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Valid to</span>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.validTo}
                onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Maximum uses</span>
              <input
                type="number"
                min="1"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="Blank = unlimited"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Status</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value === "Inactive" ? "Inactive" : "Active",
                  }))
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
            {editingId && (
              <div className="sm:col-span-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Used: <strong className="text-slate-900">{usedCountReadonly}</strong> (read-only)
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? "Save changes" : "Create coupon"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading coupons…
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">No coupons found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Validity</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.code}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDiscount(row)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatValidity(row)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatUsage(row)}</td>
                    <td className="px-4 py-3">
                      <span className={statusBadgeClass(row.lifecycleStatus)}>{row.lifecycleStatus}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        {row.deletedAt || row.status === "Inactive" ? (
                          <button
                            type="button"
                            onClick={() => setActive(row, true)}
                            className="rounded-lg px-2 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                          >
                            Enable
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSoftDelete(row)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Disable
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
