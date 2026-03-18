"use client";

import { useEffect, useState } from "react";
import { superadminApi } from "@/lib/superadmin-api";
import { LayoutDashboard, Users, Shield, FileText } from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<{ admins: number; roles: number } | null>(null);

  useEffect(() => {
    Promise.all([superadminApi.admins.list({ limit: 1 }), superadminApi.roles.list()]).then(
      ([adminsRes, rolesRes]) => {
        setStats((s) => ({
          admins: adminsRes.success && adminsRes.data ? adminsRes.data.pagination.total : s?.admins ?? 0,
          roles: rolesRes.success && rolesRes.data ? rolesRes.data.roles.length : s?.roles ?? 0,
        }));
      }
    );
  }, []);

  const cards = [
    { label: "Admins", value: stats?.admins ?? "—", icon: Users, href: "/superadmin/admins", tint: "from-blue-500 to-indigo-600" },
    { label: "Roles", value: stats?.roles ?? "—", icon: Shield, href: "/superadmin/roles", tint: "from-emerald-500 to-green-600" },
    { label: "Audit Logs", value: "View", icon: FileText, href: "/superadmin/audit-logs", tint: "from-amber-500 to-orange-600" },
  ];

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-600 mt-1">Quick overview of access control & activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group flex items-center gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-slate-300 transition"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.tint} flex items-center justify-center text-white shadow-sm`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{c.label}</p>
                <p className="text-2xl font-extrabold text-slate-900">
                  {c.value || "—"}
                </p>
                <p className="text-xs text-slate-500 mt-1 group-hover:text-[#FF6A00] transition-colors">
                  Manage →
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-lg font-extrabold text-slate-900">What you can do</h2>
          <p className="text-slate-600 mt-1">
            Create admins, define roles, and audit every critical action.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              "Approve / Reject admins",
              "Activate / Suspend access",
              "Assign role permissions",
              "Track audit logs",
            ].map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#FF6A00]/10 via-white to-emerald-50 border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-lg font-extrabold text-slate-900">Tip</h2>
          <p className="text-slate-600 mt-1">
            Keep roles minimal and grant only required modules (Catalog, Orders, Finance…).
          </p>
          <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-amber-500 to-emerald-600" />
        </div>
      </div>
    </div>
  );
}
