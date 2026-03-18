"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { superadminApi, type Admin } from "@/lib/superadmin-api";
import { Search, Plus, Pencil, Trash2, Check, X, UserCheck, UserX } from "lucide-react";

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", roleId: "", status: "INACTIVE", approvalStatus: "PENDING" });

  const fetchRoles = useCallback(async () => {
    const res = await superadminApi.roles.list();
    if (res.success && res.data) setRoles(res.data.roles.map((r) => ({ id: r.id, name: r.name })));
  }, []);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    const res = await superadminApi.admins.list({
      page: pagination.page,
      limit: pagination.limit,
      search: search || undefined,
      status: statusFilter || undefined,
      approvalStatus: approvalFilter || undefined,
      roleId: roleFilter || undefined,
    });
    setLoading(false);
    if (res.success && res.data) {
      setAdmins(res.data.admins);
      setPagination((p) => ({ ...p, ...res.data!.pagination }));
    } else toast.error("Failed to load admins.");
  }, [pagination.page, pagination.limit, search, statusFilter, approvalFilter, roleFilter]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);
  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const openCreate = () => {
    setForm({ name: "", email: "", password: "", roleId: roles[0]?.id || "", status: "INACTIVE", approvalStatus: "PENDING" });
    setEditing(null);
    setModal("create");
  };
  const openEdit = (a: Admin) => {
    setEditing(a);
    setForm({
      name: a.name,
      email: a.email,
      password: "",
      roleId: (a.role as { _id?: string })?._id || (a.role as { id?: string })?.id || "",
      status: a.status,
      approvalStatus: a.approvalStatus,
    });
    setModal("edit");
  };
  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.roleId) {
      toast.error("Name, email, password and role are required.");
      return;
    }
    const res = await superadminApi.admins.create({
      name: form.name,
      email: form.email,
      password: form.password,
      roleId: form.roleId,
      status: form.status,
      approvalStatus: form.approvalStatus,
    });
    if (res.success) {
      toast.success("Admin created.");
      closeModal();
      fetchAdmins();
    } else toast.error((res as { message?: string }).message);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const res = await superadminApi.admins.update(editing.id, {
      name: form.name,
      email: form.email,
      roleId: form.roleId || undefined,
      status: form.status,
      approvalStatus: form.approvalStatus,
    });
    if (res.success) {
      toast.success("Admin updated.");
      closeModal();
      fetchAdmins();
    } else toast.error((res as { message?: string }).message);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this admin?")) return;
    const res = await superadminApi.admins.delete(id);
    if (res.success) {
      toast.success("Admin deleted.");
      fetchAdmins();
    } else toast.error((res as { message?: string }).message);
  };

  const handleStatus = async (id: string, status: string) => {
    const res = await superadminApi.admins.updateStatus(id, status);
    if (res.success) {
      toast.success("Status updated.");
      fetchAdmins();
    } else toast.error((res as { message?: string }).message);
  };

  const handleApprove = async (id: string, action: "approve" | "reject") => {
    const res = await superadminApi.admins.approve(id, action);
    if (res.success) {
      toast.success(action === "approve" ? "Admin approved." : "Admin rejected.");
      fetchAdmins();
    } else toast.error((res as { message?: string }).message);
  };

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Management</h1>
          <p className="text-slate-600 mt-1">Create admins, assign roles, and control access lifecycle.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-sm hover:shadow-md transition"
          style={{ background: "linear-gradient(135deg, #FF6A00 0%, #E55F00 55%, #16A34A 160%)" }}
        >
          <Plus className="w-4 h-4" />
          Create Admin
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email"
              className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 w-64 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
          >
            <option value="">All approvals</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
          >
            <option value="">All roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPagination((p) => ({ ...p, page: 1 }))}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50"
          >
            Refresh
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Approval</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Created</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-900 font-medium">{a.name}</td>
                    <td className="py-3 px-4 text-slate-600">{a.email}</td>
                    <td className="py-3 px-4 text-slate-600">{(a.role as { name?: string })?.name ?? "—"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          a.status === "ACTIVE" ? "bg-green-100 text-green-800" : a.status === "SUSPENDED" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          a.approvalStatus === "APPROVED" ? "bg-green-100 text-green-800" : a.approvalStatus === "REJECTED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {a.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-sm">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="py-3 px-4 text-right">
                      {!a.isSuperAdmin && (
                        <>
                          <button type="button" onClick={() => openEdit(a)} className="p-2 text-slate-500 hover:text-amber-600 rounded" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {a.approvalStatus === "PENDING" && (
                            <>
                              <button type="button" onClick={() => handleApprove(a.id, "approve")} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Approve">
                                <UserCheck className="w-4 h-4" />
                              </button>
                              <button type="button" onClick={() => handleApprove(a.id, "reject")} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Reject">
                                <UserX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {a.status === "ACTIVE" && (
                            <button type="button" onClick={() => handleStatus(a.id, "SUSPENDED")} className="p-2 text-amber-600 hover:bg-amber-50 rounded" title="Suspend">
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          {a.status !== "ACTIVE" && a.approvalStatus === "APPROVED" && (
                            <button type="button" onClick={() => handleStatus(a.id, "ACTIVE")} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Activate">
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button type="button" onClick={() => handleDelete(a.id)} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{modal === "create" ? "Create Admin" : "Edit Admin"}</h2>
            <form onSubmit={modal === "create" ? handleCreate : handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                  disabled={modal === "edit"}
                />
              </div>
              {modal === "create" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                    required={modal === "create"}
                    minLength={6}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={form.roleId}
                  onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Approval</label>
                  <select
                    value={form.approvalStatus}
                    onChange={(e) => setForm((f) => ({ ...f, approvalStatus: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600">
                  {modal === "create" ? "Create" : "Update"}
                </button>
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">
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
