"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { superadminApi, type Admin, type Role, PERMISSION_LABELS } from "@/lib/superadmin-api";
import { ADMIN_ASSIGNABLE_PERMISSION_KEYS } from "@/lib/admin-assignable-permissions";
import { Plus, Save } from "lucide-react";

const ASSIGNABLE_PERM_SET = new Set<string>(ADMIN_ASSIGNABLE_PERMISSION_KEYS);

function assignablePermsFromAdmin(admin: Admin | undefined): string[] {
  if (!admin?.role) return [];
  const rp = (admin.role as { permissions?: string[] }).permissions;
  return Array.isArray(rp) ? rp.filter((p) => ASSIGNABLE_PERM_SET.has(p)) : [];
}

function formatAdminDropdownSuffix(admin: Admin): string {
  const name = (admin.role as { name?: string } | undefined)?.name;
  if (!name) return "(No role)";
  if (name.startsWith("Direct:")) return "(Custom permissions)";
  return `(${name})`;
}

function formatOverviewRoleCell(admin: Admin): string {
  const name = (admin.role as { name?: string } | undefined)?.name;
  if (!name) return "—";
  if (name.startsWith("Direct:")) {
    const labels = assignablePermsFromAdmin(admin)
      .map((p) => PERMISSION_LABELS[p] || p)
      .join(" · ");
    return labels || "Custom permissions";
  }
  return name;
}

/** Starter roles use the same eleven permission keys shown in the UI (no Settings). */
const DEFAULT_ROLE_TEMPLATES: Array<{ name: string; permissions: string[]; description: string }> = [
  {
    name: "Vendor onboarding",
    permissions: ["sellers", "support_tickets"],
    description: "Sellers Approval & Support Tickets",
  },
  {
    name: "Catalog",
    permissions: ["categories", "products"],
    description: "Categories & Products Approval",
  },
  {
    name: "Operations",
    permissions: ["orders", "returns", "analytics", "support_tickets"],
    description: "Orders Management, Returns, Analytics, Support Tickets",
  },
  {
    name: "Finance",
    permissions: ["settlements"],
    description: "Settlements",
  },
  {
    name: "Content & alerts",
    permissions: ["notifications", "cms"],
    description: "Notifications & CMS",
  },
];

export default function SuperAdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Role | null>(null);
  const [quickEditRoleId, setQuickEditRoleId] = useState("");
  const [formName, setFormName] = useState("");
  const [formPerms, setFormPerms] = useState<string[]>([]);
  const [formDesc, setFormDesc] = useState("");

  const [assignAdminId, setAssignAdminId] = useState<string>("");
  /** Permissions for the selected admin in "Assign permissions" (eleven modules). */
  const [assignAdminPermissions, setAssignAdminPermissions] = useState<string[]>([]);

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
    const res = await superadminApi.roles.list();
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

  useEffect(() => {
    if ((!assignAdminId || !assignableAdmins.some((a) => a.id === assignAdminId)) && assignableAdmins.length > 0) {
      setAssignAdminId(assignableAdmins[0]!.id);
    }
  }, [assignAdminId, assignableAdmins]);
  useEffect(() => {
    const admin = admins.find((a) => a.id === assignAdminId && !a.isSuperAdmin);
    setAssignAdminPermissions(assignablePermsFromAdmin(admin));
  }, [assignAdminId, admins]);

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
    setFormPerms((r.permissions || []).filter((p) => ASSIGNABLE_PERM_SET.has(p)));
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

  const toggleAssignAdminPerm = (p: string) => {
    setAssignAdminPermissions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
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

  const handleSaveAdminPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = assignAdminId.trim();
    if (!adminId) return;
    const admin = safeAdmins.find((a) => a.id === adminId);
    if (admin?.isSuperAdmin) {
      toast.error("Super Admin permissions cannot be changed here.");
      return;
    }
    const res = await superadminApi.admins.update(adminId, { permissions: assignAdminPermissions });
    if (res.success) {
      toast.success("Permissions saved.");
      fetchAdmins();
      fetchData();
    } else {
      toast.error((res as { message?: string }).message ?? "Failed to save permissions");
    }
  };

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-slate-600 mt-1 max-w-2xl">
            Assign the eleven admin modules to each admin, or define reusable roles with Create Role.{" "}
            <span className="text-slate-500">
              <strong className="font-semibold text-slate-700">Settings</strong> (profile / password) is{" "}
              always available to every admin in the admin panel and is not part of this permission list.
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {assignableRoles.length > 0 && (
            <>
              <select
                value={quickEditRoleId}
                onChange={(e) => setQuickEditRoleId(e.target.value)}
                className="min-w-[200px] px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
              >
                <option value="">Edit existing role…</option>
                {assignableRoles
                  .filter((r) => !!r?.id)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name || "Untitled"}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                disabled={!quickEditRoleId}
                onClick={() => {
                  const r = assignableRoles.find((x) => x.id === quickEditRoleId);
                  if (r) openEdit(r);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
              >
                Edit
              </button>
            </>
          )}
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
      </div>

      {/* Assign module permissions directly to each admin */}
      <div className="mb-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Assign permissions to admin</h2>
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
        ) : (
          <form onSubmit={handleSaveAdminPermissions} className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Admin</label>
                <select
                  value={assignAdminId}
                  onChange={(e) => setAssignAdminId(e.target.value)}
                  className="min-w-72 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
                >
                  {assignableAdmins.map((a) => (
                    <option key={a.id} value={a.id}>
                      {(a.name || "Admin")} — {a.email} {formatAdminDropdownSuffix(a)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-white font-semibold shadow-sm hover:shadow-md transition"
                style={{ background: "linear-gradient(135deg, #FF6A00 0%, #E55F00 55%, #16A34A 160%)" }}
              >
                Save permissions
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Modules</label>
              <p className="text-xs text-slate-500 mb-1">
                Select any combination. Account Settings is always on for all admins and is not listed here.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border border-slate-200 rounded-xl bg-slate-50/70 p-3 max-h-64 overflow-y-auto">
                {(permissions.length ? permissions : [...ADMIN_ASSIGNABLE_PERMISSION_KEYS]).map((p) => (
                  <label key={p} className="flex items-center gap-2 py-1 px-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignAdminPermissions.includes(p)}
                      onChange={() => toggleAssignAdminPerm(p)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-700">{PERMISSION_LABELS[p] || p}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Admin role overview */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Admin permissions overview</h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Direct assignments show module names; legacy named roles show the role title.
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Role / permissions</th>
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
                        <td className="py-3 px-4 text-slate-700 text-sm max-w-md">
                          {formatOverviewRoleCell(a)}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Permissions</label>
                <p className="text-xs text-slate-500 mb-2">
                  Same modules as the admin sidebar except Settings (always enabled for every admin).
                </p>
                <div className="border border-slate-200 rounded-xl p-3 space-y-2 max-h-64 overflow-y-auto bg-slate-50/40">
                  {(permissions.length ? permissions : [...ADMIN_ASSIGNABLE_PERMISSION_KEYS]).map((p) => (
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
