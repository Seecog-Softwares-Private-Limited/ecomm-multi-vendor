"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";

type Placement = "PROMO" | "HERO";

type BannerRow = {
  id: string;
  placement: Placement;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  ctaText: string | null;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const SECTIONS: { placement: Placement; title: string; hint: string }[] = [
  {
    placement: "PROMO",
    title: "Top promotional cards",
    hint: "Small cards at the top of the home page. Recommended image size: 640 × 400 px.",
  },
  {
    placement: "HERO",
    title: "Large home page banner",
    hint: "Full-width slider lower on the home page. Recommended image size: 1440 × 430 px.",
  },
];

const emptyForm = {
  placement: "PROMO" as Placement,
  imageUrl: "",
  title: "",
  subtitle: "",
  ctaText: "",
  linkUrl: "",
  sortOrder: 0,
  isActive: true,
};

export function BannersManagement() {
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BannerRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/banners", { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? "Failed to load banners");
        return;
      }
      setBanners(Array.isArray(json.data) ? json.data : []);
    } catch {
      setError("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = (placement: Placement) => {
    const inSection = banners.filter((b) => b.placement === placement);
    setEditingId(null);
    setForm({
      ...emptyForm,
      placement,
      sortOrder: inSection.length ? Math.max(...inSection.map((b) => b.sortOrder)) + 1 : 0,
    });
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (b: BannerRow) => {
    setEditingId(b.id);
    setForm({
      placement: b.placement,
      imageUrl: b.imageUrl,
      title: b.title ?? "",
      subtitle: b.subtitle ?? "",
      ctaText: b.ctaText ?? "",
      linkUrl: b.linkUrl,
      sortOrder: b.sortOrder,
      isActive: b.isActive,
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleUpload = async (file: File) => {
    setFormError(null);
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/banners/upload", {
        method: "POST",
        credentials: "include",
        body: data,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json?.error?.message ?? "Failed to upload image");
        return;
      }
      setForm((f) => ({ ...f, imageUrl: json.data.url }));
    } catch {
      setFormError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/admin/banners/${editingId}` : "/api/admin/banners", {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json?.error?.message ?? "Failed to save banner");
        return;
      }
      setShowForm(false);
      load();
    } catch {
      setFormError("Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/banners/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? "Failed to delete banner");
        return;
      }
      load();
    } catch {
      setError("Failed to delete banner");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Banners</h1>
        <p className="mt-1 text-sm text-slate-500">
          Change the banners on the home page. Until a section has an active banner here, it shows the default banners.
        </p>
      </div>

      {error && <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : (
        SECTIONS.map((section) => {
          const rows = banners.filter((b) => b.placement === section.placement);
          return (
            <section key={section.placement} className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">{section.hint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openAdd(section.placement)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Add banner
                </button>
              </div>

              {rows.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  No banners added. The default banners are showing.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {rows.map((b) => (
                    <li key={b.id} className="flex flex-wrap items-center gap-4 py-3">
                      <img src={b.imageUrl} alt="" className="h-16 w-28 rounded-lg bg-slate-100 object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{b.title || "Image only"}</p>
                        <p className="truncate text-sm text-slate-500">{b.linkUrl}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Order {b.sortOrder} · {b.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(b)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(b)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="banner-form-title"
        >
          <form
            onSubmit={handleSave}
            className="max-h-full w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 id="banner-form-title" className="text-lg font-semibold text-slate-900">
                {editingId ? "Edit banner" : "Add banner"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className={labelClass} htmlFor="banner-placement">Section</label>
              <select
                id="banner-placement"
                className={inputClass}
                value={form.placement}
                onChange={(e) => setForm({ ...form, placement: e.target.value as Placement })}
              >
                {SECTIONS.map((s) => (
                  <option key={s.placement} value={s.placement}>{s.title}</option>
                ))}
              </select>
            </div>

            <div>
              <span className={labelClass}>Image</span>
              {form.imageUrl && (
                <img src={form.imageUrl} alt="" className="mb-2 h-32 w-full rounded-xl bg-slate-100 object-cover" />
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {form.imageUrl ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            <div>
              <label className={labelClass} htmlFor="banner-link">Link when clicked</label>
              <input
                id="banner-link"
                className={inputClass}
                value={form.linkUrl}
                placeholder="/category/footwear"
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              />
            </div>

            <p className="text-sm text-slate-500">
              Text is optional. Leave it blank if your image already includes the text.
            </p>
            <div>
              <label className={labelClass} htmlFor="banner-title">Title</label>
              <input
                id="banner-title"
                className={inputClass}
                maxLength={120}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="banner-subtitle">Subtitle</label>
              <input
                id="banner-subtitle"
                className={inputClass}
                maxLength={255}
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="banner-cta">Button text</label>
              <input
                id="banner-cta"
                className={inputClass}
                maxLength={40}
                value={form.ctaText}
                placeholder="Shop now"
                onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="banner-order">Display order</label>
                <input
                  id="banner-order"
                  type="number"
                  className={inputClass}
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="banner-status">Status</label>
                <select
                  id="banner-status"
                  className={inputClass}
                  value={form.isActive ? "Active" : "Inactive"}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === "Active" })}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            {formError && <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{formError}</div>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save banner"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="banner-delete-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl">
            <h3 id="banner-delete-title" className="text-lg font-semibold text-slate-900">Delete banner?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This removes the banner permanently. To hide it for now, edit it and set the status to Inactive.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
