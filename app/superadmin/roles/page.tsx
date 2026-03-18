"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { superadminApi, type Role, PERMISSION_LABELS } from "@/lib/superadmin-api";
import { Plus, Pencil, Save } from "lucide-react";

export default function SuperAdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Role | null>(null);
  const [formName, setFormName] = useState("");
  const [formPerms, setFormPerms] = useState<string[]>([]);
  const [formDesc, setFormDesc] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const res = await superadminApi.roles.list();
    setLoading(false);
    if (res.success && res.data) {
      setRoles(res.data.roles);
      setPermissions(res.data.permissions || []);
    } else toast.error("Failed to load roles.");
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setFormName("");
    setFormPerms([]);
    setFormDesc("");
    setEditing(null);
    setModal("create");
  };
  const openEdit = (r: Role) => {
    setEditing(r);
    setFormName(r.name);
    setFormPerms(r.permissions || []);
    setFormDesc(r.description || "");
    setModal("edit");
  };
  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  const togglePerm = (p: string) => {
    setFormPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Role name is required.");
      return;
    }
    const res = await superadminApi.roles.create({
      name: formName.trim(),
      permissions: formPerms,
      description: formDesc,
    });
    if (res.success) {
      toast.success("Role created.");
      closeModal();
      fetchData();
    } else toast.error((res as { message?: string }).message);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const res = await superadminApi.roles.update(editing.id, {
      name: formName.trim(),
      permissions: formPerms,
      description: formDesc,
    });
    if (res.success) {
      toast.success("Role updated.");
      closeModal();
      fetchData();
    } else toast.error((res as { message?: string }).message);
  };

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-slate-600 mt-1">
            Define access modules and assign them to admins.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-sm hover:shadow-md transition"
          style={{ background: "linear-gradient(135deg, #FF6A00 0%, #E55F00 55%, #16A34A 160%)" }}
        >
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Permissions</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">{r.name}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                        {(r.permissions || []).length} module(s)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="p-2 text-slate-500 hover:text-[#FF6A00] rounded-lg hover:bg-[#FFF4EC] transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 border border-slate-200/80">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{modal === "create" ? "Create Role" : "Edit Role"}</h2>
            <form onSubmit={modal === "create" ? handleCreate : handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
                  placeholder="e.g. Manager, Finance"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Permissions</label>
                <div className="border border-slate-200 rounded-xl p-3 space-y-2 max-h-56 overflow-y-auto bg-slate-50/40">
                  {(permissions.length ? permissions : Object.keys(PERMISSION_LABELS)).map((p) => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formPerms.includes(p)}
                        onChange={() => togglePerm(p)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-sm text-slate-700">{PERMISSION_LABELS[p] || p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition"
                  style={{ background: "linear-gradient(135deg, #FF6A00 0%, #E55F00 55%, #16A34A 160%)" }}
                >
                  <Save className="w-4 h-4" />
                  {modal === "create" ? "Create" : "Update"}
                </button>
                <button type="button" onClick={closeModal} className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
