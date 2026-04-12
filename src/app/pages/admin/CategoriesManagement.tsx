"use client";

import { Plus, Edit, Trash2, X, FileText } from "lucide-react";
import * as React from "react";
import { useRouter } from "next/navigation";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdDate: string;
  subcategories?: { id: string; name: string; slug: string; status: string; createdDate: string }[];
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
  const [formParentId, setFormParentId] = React.useState("");
  const [formCategoryType, setFormCategoryType] = React.useState<"parent" | "sub">("parent");
  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const [docModalCategoryId, setDocModalCategoryId] = React.useState<string | null>(null);
  const [docModalCategoryName, setDocModalCategoryName] = React.useState("");
  const [docRequirements, setDocRequirements] = React.useState<{ id: string; documentName: string; isRequired: boolean }[]>([]);
  const [docReqLoading, setDocReqLoading] = React.useState(false);
  const [docReqAddName, setDocReqAddName] = React.useState("");
  const [docReqAddOptional, setDocReqAddOptional] = React.useState(true);
  const [docReqAddLoading, setDocReqAddLoading] = React.useState(false);
  const [docReqAddError, setDocReqAddError] = React.useState<string | null>(null);
  const [docReqDeleteLoading, setDocReqDeleteLoading] = React.useState<string | null>(null);

  const [editCategory, setEditCategory] = React.useState<CategoryRow | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editSlug, setEditSlug] = React.useState("");
  const [editStatus, setEditStatus] = React.useState("Active");
  const [editLoading, setEditLoading] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);

  const [deleteCategory, setDeleteCategory] = React.useState<CategoryRow | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

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
    setFormParentId("");
    setFormCategoryType("parent");
    setSubmitError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (row: CategoryRow) => {
    setEditCategory(row);
    setEditName(row.name);
    setEditSlug(row.slug);
    setEditStatus(row.status);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    setEditError(null);
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${editCategory.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          slug: editSlug.trim() || undefined,
          status: editStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setEditError(json?.error?.message ?? "Failed to update category");
        return;
      }
      setEditCategory(null);
      fetchCategories();
    } catch {
      setEditError("Failed to update category");
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCategory) return;
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleteCategory.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setDeleteError(json?.error?.message ?? "Failed to delete category");
        return;
      }
      setDeleteCategory(null);
      fetchCategories();
    } catch {
      setDeleteError("Failed to delete category");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDocModal = React.useCallback(
    (categoryId: string, categoryName: string) => {
      setDocModalCategoryId(categoryId);
      setDocModalCategoryName(categoryName);
      setDocReqAddName("");
      setDocReqAddOptional(true);
      setDocReqAddError(null);
      setDocRequirements([]);
      setDocReqLoading(true);
      fetch(`/api/admin/categories/${categoryId}/document-requirements`, { credentials: "include" })
        .then((res) => res.json())
        .then((json) => {
          if (json?.success && Array.isArray(json.data)) setDocRequirements(json.data);
        })
        .catch(() => setDocRequirements([]))
        .finally(() => setDocReqLoading(false));
    },
    []
  );

  const closeDocModal = () => {
    setDocModalCategoryId(null);
    setDocModalCategoryName("");
    setDocRequirements([]);
  };

  const handleAddDocRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docModalCategoryId || !docReqAddName.trim()) return;
    setDocReqAddError(null);
    setDocReqAddLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${docModalCategoryId}/document-requirements`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentName: docReqAddName.trim(), isRequired: !docReqAddOptional }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setDocReqAddError(json?.error?.message ?? "Failed to add");
        return;
      }
      setDocRequirements((prev) => [...prev, json.data]);
      setDocReqAddName("");
    } catch {
      setDocReqAddError("Failed to add");
    } finally {
      setDocReqAddLoading(false);
    }
  };

  const handleDeleteDocRequirement = async (requirementId: string) => {
    if (!docModalCategoryId) return;
    setDocReqDeleteLoading(requirementId);
    try {
      const res = await fetch(`/api/admin/categories/${docModalCategoryId}/document-requirements`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requirementId }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        setDocRequirements((prev) => prev.filter((r) => r.id !== requirementId));
      }
    } finally {
      setDocReqDeleteLoading(null);
    }
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
          parentId: formCategoryType === "sub" ? (formParentId.trim() || undefined) : undefined,
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
    <div className="min-h-full bg-slate-50/80 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
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
        <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 touch-pan-x sm:mx-0 sm:px-0">
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
                <React.Fragment key={category.id}>
                  <tr className="transition-colors hover:bg-slate-50/50">
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
                          onClick={() => openDocModal(category.id, category.name)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600"
                          title="Additional KYC documents for this category"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(category)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCategory(category)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {category.subcategories?.map((sub) => (
                    <tr key={sub.id} className="bg-slate-50/50 transition-colors hover:bg-slate-100/50">
                      <td className="whitespace-nowrap px-6 py-3 pl-12 text-sm font-medium text-slate-700">
                        — {sub.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-600 font-mono">
                        {sub.slug}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3">
                        <span className={statusBadgeClass(sub.status)}>{sub.status}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-500">
                        {sub.createdDate}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3" />
                    </tr>
                  ))}
                </React.Fragment>
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
                <span className="block text-sm font-medium text-slate-700">What do you want to add?</span>
                <div className="mt-2 flex flex-wrap gap-4">
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="category-type"
                      checked={formCategoryType === "parent"}
                      onChange={() => { setFormCategoryType("parent"); setFormParentId(""); }}
                      className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">New parent category</span>
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="category-type"
                      checked={formCategoryType === "sub"}
                      onChange={() => setFormCategoryType("sub")}
                      className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">New subcategory under existing parent</span>
                  </label>
                </div>
              </div>
              {formCategoryType === "sub" && (
                <div>
                  <label
                    htmlFor="parent-category"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Parent Category
                  </label>
                  <select
                    id="parent-category"
                    value={formParentId}
                    onChange={(e) => setFormParentId(e.target.value)}
                    required={formCategoryType === "sub"}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Select parent category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Choose the parent under which this subcategory will appear.
                  </p>
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
                  disabled={
                    submitLoading ||
                    !formName.trim() ||
                    (formCategoryType === "sub" && !formParentId.trim())
                  }
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
                >
                  {submitLoading ? "Creating…" : formCategoryType === "sub" ? "Create Subcategory" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document requirements modal (additional KYC docs per category) */}
      {docModalCategoryId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={closeDocModal}
          onKeyDown={(e) => e.key === "Escape" && closeDocModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="doc-modal-title"
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 id="doc-modal-title" className="text-lg font-semibold text-slate-900">
                  Additional documents — {docModalCategoryName}
                </h3>
                <button
                  type="button"
                  onClick={closeDocModal}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Vendors who choose this category can optionally upload these documents in Profile &amp; KYC.
              </p>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
              {docReqLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                </div>
              ) : (
                <>
                  {docRequirements.length === 0 ? (
                    <p className="text-sm text-slate-500 rounded-lg bg-slate-50 px-4 py-3 border border-slate-200">
                      No additional documents defined. Add document types below so vendors can optionally upload them.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {docRequirements.map((r) => (
                        <li
                          key={r.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5"
                        >
                          <span className="font-medium text-slate-800">{r.documentName}</span>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.isRequired ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                              {r.isRequired ? "Required" : "Optional"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteDocRequirement(r.id)}
                              disabled={docReqDeleteLoading === r.id}
                              className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <form onSubmit={handleAddDocRequirement} className="border-t border-slate-200 pt-4 space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700">Add document type</h4>
                    {docReqAddError && (
                      <p className="text-sm text-rose-600">{docReqAddError}</p>
                    )}
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={docReqAddName}
                        onChange={(e) => setDocReqAddName(e.target.value)}
                        placeholder="e.g. FSSAI License, Drug License"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={docReqAddOptional}
                          onChange={(e) => setDocReqAddOptional(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>
                          Optional (vendor may skip) — <strong>uncheck to make mandatory</strong>
                        </span>
                      </label>
                      <p className="text-xs text-slate-500">
                        {docReqAddOptional
                          ? "Document will be optional; profile can be submitted without it."
                          : "Document will be mandatory; vendor profile stays incomplete until uploaded."}
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={docReqAddLoading || !docReqAddName.trim()}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {docReqAddLoading ? "Adding…" : "Add"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setEditCategory(null)}
          onKeyDown={(e) => e.key === "Escape" && setEditCategory(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 id="edit-modal-title" className="text-lg font-semibold text-slate-900">
                Edit Category
              </h3>
              <button
                type="button"
                onClick={() => setEditCategory(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {editError && (
                <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
                  {editError}
                </div>
              )}
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700">
                  Category Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter category name"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label htmlFor="edit-slug" className="block text-sm font-medium text-slate-700">
                  Slug
                </label>
                <input
                  id="edit-slug"
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  placeholder="e.g. electronics"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 font-mono text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  id="edit-status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditCategory(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading || !editName.trim()}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
                >
                  {editLoading ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {deleteCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setDeleteCategory(null)}
          onKeyDown={(e) => e.key === "Escape" && setDeleteCategory(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 id="delete-modal-title" className="text-lg font-semibold text-slate-900">
                Delete category?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                &quot;{deleteCategory.name}&quot; will be deactivated (soft delete). You can reactivate it later by editing and setting status to Active.
              </p>
            </div>
            {deleteError && (
              <div className="mb-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteCategory(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
