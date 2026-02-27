"use client";

import { Plus, Edit, Trash2, X } from "lucide-react";
import * as React from "react";
import { useRouter } from "next/navigation";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdDate: string;
};

function statusBadgeClass(status: string): string {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  switch (status.toLowerCase()) {
    case "active":
      return `${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20`;
    case "inactive":
      return `${base} bg-slate-100 text-slate-600 ring-1 ring-slate-300/50`;
    default:
      return `${base} bg-slate-100 text-slate-600 ring-1 ring-slate-300/50`;
  }
}

export function CategoriesManagement() {
  const router = useRouter();
  const [showModal, setShowModal] = React.useState(false);
  const [categories, setCategories] = React.useState<CategoryRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [formName, setFormName] = React.useState("");
  const [formSlug, setFormSlug] = React.useState("");
  const [formStatus, setFormStatus] = React.useState("Active");
  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json?.error?.message ?? "Failed to load categories";
        setError(msg);
        if (res.status === 401 || (res.status === 403 && String(msg).toLowerCase().includes("admin"))) {
          router.replace(`/admin/login?callbackUrl=${encodeURIComponent("/admin/categories")}`);
        }
        setCategories([]);
        return;
      }
      setCategories(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = () => {
    setFormName("");
    setFormSlug("");
    setFormStatus("Active");
    setSubmitError(null);
    setShowModal(true);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          slug: formSlug.trim() || undefined,
          status: formStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setSubmitError(json?.error?.message ?? "Failed to create category");
        return;
      }
      setShowModal(false);
      fetchCategories();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to create category");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50/80 p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Categories Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage product categories
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {error && (
          <div className="border-b border-slate-200 bg-rose-50/80 px-6 py-4 text-sm text-rose-700">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Name
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Slug
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Created Date
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    No categories yet. Add one above.
                  </td>
                </tr>
              ) : (
              categories.map((category) => (
                <tr
                  key={category.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                    {category.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600 font-mono">
                    {category.slug}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={statusBadgeClass(category.status)}>
                      {category.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {category.createdDate}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3
                id="modal-title"
                className="text-lg font-semibold text-slate-900"
              >
                Add New Category
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              {submitError && (
                <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
                  {submitError}
                </div>
              )}
              <div>
                <label
                  htmlFor="category-name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Category Name
                </label>
                <input
                  id="category-name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter category name"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label
                  htmlFor="category-slug"
                  className="block text-sm font-medium text-slate-700"
                >
                  Slug
                </label>
                <input
                  id="category-slug"
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. lifestyle (optional, auto-generated from name)"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 font-mono text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label
                  htmlFor="category-status"
                  className="block text-sm font-medium text-slate-700"
                >
                  Status
                </label>
                <select
                  id="category-status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || !formName.trim()}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
                >
                  {submitLoading ? "Creating…" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
