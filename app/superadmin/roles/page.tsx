"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { superadminApi, type Admin, type Role, PERMISSION_LABELS } from "@/lib/superadmin-api";
import { Plus, Pencil, Save } from "lucide-react";

const DEFAULT_ROLE_TEMPLATES: Array<{ name: string; permissions: string[]; description: string }> = [
  {
    name: "Seller Manager",
    permissions: ["sellers", "support_tickets"],
    description: "Manages vendor onboarding, status, and basic seller support.",
  },
  {
    name: "Catalog Manager",
    permissions: ["categories", "products"],
    description: "Manages categories and product catalog quality.",
  },
  {
    name: "Operations Manager",
    permissions: ["orders", "returns", "analytics", "support_tickets"],
    description: "Handles orders, escalations, and customer support workflows.",
  },
  {
    name: "Finance Manager",
    permissions: ["settlements"],
    description: "Handles settlements, refunds, and finance operations.",
  },
];

export default function SuperAdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Role | null>(null);
  const [formName, setFormName] = useState("");
  const [formPerms, setFormPerms] = useState<string[]>([]);
  const [formDesc, setFormDesc] = useState("");

  const [assignAdminId, setAssignAdminId] = useState<string>("");
  const [assignRoleIds, setAssignRoleIds] = useState<string[]>([]);

  const safeRoles = useMemo(() => (Array.isArray(roles) ? roles.filter(Boolean) : []), [roles]);
  const safeAdmins = useMemo(() => (Array.isArray(admins) ? admins.filter(Boolean) : []), [admins]);
  const assignableRoles = useMemo(
    () => safeRoles.filter((r) => (r?.name || "").trim().toLowerCase() !== "super admin"),
    [safeRoles]
  );
  const assignableAdmins = useMemo(
    () => safeAdmins.filter((a) => !a?.isSuperAdmin),
    [safeAdmins]
  );

  const fetchData = async () => {
    setLoading(true);
    const res = await superadminApi.roles.list();
    setLoading(false);
    if (res.success && res.data) {
      let loadedRoles = res.data.roles;
      const hasNonSuperRole = loadedRoles.some(
        (r) => (r?.name || "").trim().toLowerCase() !== "super admin"
      );
      if (!hasNonSuperRole) {
        for (const tpl of DEFAULT_ROLE_TEMPLATES) {
          // Best-effort role bootstrap for first-time setup.
          await superadminApi.roles.create({
            name: tpl.name,
            permissions: tpl.permissions,
            description: tpl.description,
          });
        }
        const again = await superadminApi.roles.list();
        if (again.success && again.data) loadedRoles = again.data.roles;
      }
      setRoles(loadedRoles);
      setPermissions(res.data.permissions || []);
    } else toast.error("Failed to load roles.");
  };

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      // Pull a larger page size so unassigned-role admins are visible.
      // If you have >100 admins, we can add pagination later.
      const res = await superadminApi.admins.list({ page: 1, limit: 100 });
      if (res.success && res.data) {
        const adminList = Array.isArray(res.data.admins) ? res.data.admins.filter(Boolean) : [];
        setAdmins(adminList);
        const firstAdmin = adminList.find((a) => !a?.isSuperAdmin);
        if (firstAdmin && !assignAdminId) setAssignAdminId(firstAdmin.id);
      } else {
        toast.error("Failed to load admins.");
      }
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAdmins();
  }, []);

  const roleOptions = useMemo(
    () =>
      assignableRoles
        .filter((r) => !!r?.id)
        .map((r) => ({ id: r.id, name: r.name || "Untitled role" })),
    [assignableRoles]
  );
  useEffect(() => {
    if ((!assignAdminId || !assignableAdmins.some((a) => a.id === assignAdminId)) && assignableAdmins.length > 0) {
      setAssignAdminId(assignableAdmins[0]!.id);
    }
  }, [assignAdminId, assignableAdmins]);
  useEffect(() => {
    const validSet = new Set(roleOptions.map((r) => r.id));
    const cleaned = assignRoleIds.filter((id) => validSet.has(id));
    if (cleaned.length !== assignRoleIds.length) {
      setAssignRoleIds(cleaned);
      return;
    }
    if (cleaned.length === 0 && roleOptions.length > 0) {
      setAssignRoleIds([roleOptions[0]!.id]);
    }
  }, [assignRoleIds, roleOptions]);

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
      fetchAdmins(); // role label counts can change
    } else toast.error((res as { message?: string }).message);
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = assignAdminId.trim();
    const roleIds = assignRoleIds.filter(Boolean);
    if (!adminId || roleIds.length === 0) return;
    const admin = safeAdmins.find((a) => a.id === adminId);
    if (admin?.isSuperAdmin) {
      toast.error("Super Admin role cannot be changed.");
      return;
    }
    if (!roleIds.every((id) => roleOptions.some((r) => r.id === id))) {
      toast.error("Please select valid non-super-admin roles.");
      return;
    }
    const res =
      roleIds.length === 1
        ? await superadminApi.admins.update(adminId, { roleId: roleIds[0] })
        : await superadminApi.admins.update(adminId, { roleIds } as any);
    if (res.success) {
      toast.success(roleIds.length > 1 ? "Multiple roles assigned." : "Role assigned.");
      fetchAdmins();
      fetchData();
    } else {
      toast.error((res as { message?: string }).message ?? "Failed to assign role");
    }
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

      {/* Assign roles to admins (top placement for visibility) */}
      <div className="mb-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Assign Role to Admin</h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Admins loaded from API: <span className="font-semibold">{safeAdmins.length}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={fetchAdmins}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50"
          >
            Refresh Admin List
          </button>
        </div>

        {loadingAdmins ? (
          <div className="py-8 text-center text-slate-500">Loading admins…</div>
        ) : assignableAdmins.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            No admins returned from API. Create an admin first from the Admins page.
          </div>
        ) : roleOptions.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            Create at least one non-Super-Admin role to assign admins.
          </div>
        ) : (
          <form onSubmit={handleAssignRole} className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Admin</label>
              <select
                value={assignAdminId}
                onChange={(e) => setAssignAdminId(e.target.value)}
                className="min-w-72 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
              >
                {assignableAdmins.map((a) => (
                  <option key={a.id} value={a.id}>
                    {(a.name || "Admin")} — {a.email} {(a.role as any)?.name ? `(${(a.role as any).name})` : "(No role)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <div className="min-w-72 border border-slate-200 rounded-xl bg-slate-50/70 p-2 max-h-36 overflow-y-auto">
                {roleOptions.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 py-1 px-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignRoleIds.includes(r.id)}
                      onChange={(e) => {
                        setAssignRoleIds((prev) =>
                          e.target.checked ? [...prev, r.id] : prev.filter((id) => id !== r.id)
                        );
                      }}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-700">{r.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500">Select one or multiple roles.</p>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-white font-semibold shadow-sm hover:shadow-md transition"
              style={{ background: "linear-gradient(135deg, #FF6A00 0%, #E55F00 55%, #16A34A 160%)" }}
            >
              Assign Role
            </button>
          </form>
        )}
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
                {safeRoles.map((r) => (
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

      {/* Admin role overview */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Admin Role Overview</h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Admins with no assigned role will show as “—”.
            </p>
          </div>
        </div>

        {loadingAdmins ? (
          <div className="py-10 text-center text-slate-500">Loading admins…</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border border-slate-200 rounded-xl">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Admin</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Current Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {safeAdmins
                    .filter((a) => !a.isSuperAdmin)
                    .map((a) => (
                      <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{a.name || "Admin"}</div>
                          <div className="text-sm text-slate-600">{a.email}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {(a.role as any)?.name ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{a.status}</td>
                        <td className="py-3 px-4 text-slate-700">{a.approvalStatus}</td>
                      </tr>
                    ))}
                  {safeAdmins.filter((a) => !a.isSuperAdmin).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-500">
                        No admins found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
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
