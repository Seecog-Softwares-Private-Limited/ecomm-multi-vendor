"use client";

import { useEffect, useState, useCallback } from "react";
import { superadminApi, type AuditLog } from "@/lib/superadmin-api";
import { FileText } from "lucide-react";

export default function SuperAdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const res = await superadminApi.auditLogs.list({
      page: pagination.page,
      limit: pagination.limit,
      module: moduleFilter || undefined,
      action: actionFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    setLoading(false);
    if (res.success && res.data) {
      setLogs(res.data.logs);
      setPagination((p) => ({ ...p, ...res.data!.pagination }));
    }
  }, [pagination.page, pagination.limit, moduleFilter, actionFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Audit Logs</h1>
          <p className="text-slate-600 mt-1">Track critical Super Admin activity across modules.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
        <input
          type="text"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          placeholder="Action"
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 w-44 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
        />
        <input
          type="text"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          placeholder="Module"
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 w-44 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
        />
        <button
          type="button"
          onClick={() => fetchLogs()}
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Admin</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Module</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-600 text-sm">
                      {l.createdAt ? new Date(l.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {l.adminName || l.adminEmail || l.adminId || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FFF4EC] text-[#FF6A00] border border-[#FFE4CC]">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{l.module}</td>
                    <td className="py-3 px-4 text-slate-500 text-sm">
                      {l.metadata && Object.keys(l.metadata).length > 0
                        ? JSON.stringify(l.metadata)
                        : "—"}
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
    </div>
  );
}
