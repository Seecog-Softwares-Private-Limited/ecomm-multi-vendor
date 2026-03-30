"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

export type CareerOpeningRow = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description?: string | null;
  published: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

const emptyForm = {
  title: "",
  department: "",
  location: "",
  employmentType: "",
  description: "",
  published: true,
  sortOrder: 0,
};

export function AdminCareerOpeningsPage() {
  const [openings, setOpenings] = useState<CareerOpeningRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setMessage(null);
    const res = await fetch("/api/admin/cms/career-openings", { credentials: "include", cache: "no-store" });
    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      data?: { openings?: CareerOpeningRow[] };
      error?: { message?: string };
    };
    if (!res.ok || !json?.success) {
      setMessage({ type: "error", text: json?.error?.message ?? `Could not load (${res.status})` });
      setOpenings([]);
      return;
    }
    setOpenings(Array.isArray(json.data?.openings) ? json.data!.openings! : []);
  }, []);

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

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage(null);
  }

  function startEdit(row: CareerOpeningRow) {
    setEditingId(row.id);
    setForm({
      title: row.title,
      department: row.department,
      location: row.location,
      employmentType: row.employmentType,
      description: row.description ?? "",
      published: row.published,
      sortOrder: row.sortOrder,
    });
    setShowForm(true);
    setMessage(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const url = editingId
        ? `/api/admin/cms/career-openings/${encodeURIComponent(editingId)}`
        : "/api/admin/cms/career-openings";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({
          type: "error",
          text: json?.error?.message ?? json?.error?.fields ?? "Save failed",
        });
        return;
      }
      setMessage({ type: "success", text: editingId ? "Opening updated." : "Opening created." });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this job opening? It will disappear from the careers page.")) return;
    setMessage(null);
    const res = await fetch(`/api/admin/cms/career-openings/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage({ type: "error", text: json?.error?.message ?? "Delete failed" });
      return;
    }
    setMessage({ type: "success", text: "Deleted." });
    if (editingId === id) {
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    }
    await load();
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <Link
        href="/admin/cms/about-us"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-amber-700 mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        About Us
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Career openings</h1>
          <p className="mt-1 text-sm text-slate-600">
            Jobs listed here appear on the storefront{" "}
            <a
              href="/info/careers#openings"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 font-medium hover:underline"
            >
              Careers
            </a>{" "}
            page when <strong>Published</strong> is on.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" />
          Add opening
        </button>
      </div>

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
            {editingId ? "Edit opening" : "New opening"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">Job title</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                maxLength={255}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Department</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                required
                maxLength={255}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Location</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                required
                maxLength={255}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">Employment type</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.employmentType}
                onChange={(e) => setForm((f) => ({ ...f, employmentType: e.target.value }))}
                required
                placeholder="e.g. Full-time, Internship"
                maxLength={120}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">Job description</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono min-h-[140px] resize-y"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Paste the full role description (plain text). Shown when visitors open this job on the Careers page."
                maxLength={65535}
              />
              <span className="text-xs text-slate-400">Optional. Line breaks are preserved.</span>
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              />
              <span className="text-sm text-slate-700">Published (visible on careers page)</span>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Sort order</span>
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value || "0", 10) || 0 }))
                }
              />
              <span className="text-xs text-slate-400">Lower numbers appear first.</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
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

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 py-12">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      ) : openings.length === 0 ? (
        <p className="text-slate-600 text-sm py-6 border border-dashed border-slate-200 rounded-xl px-4">
          No openings yet. Use <strong>Add opening</strong> to create one. Until there are published roles,
          visitors still see the general “Send resume” card on the careers page.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {openings.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">{row.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {row.department} · {row.location} · {row.employmentType}
                  {!row.published && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-amber-900">Draft</span>
                  )}
                  <span className="ml-2 text-slate-400">sort {row.sortOrder}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(row)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
