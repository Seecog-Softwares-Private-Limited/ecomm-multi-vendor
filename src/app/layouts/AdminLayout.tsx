import * as React from "react";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminHeader } from "../components/admin/AdminHeader";

export type AdminLayoutProps = {
  children: React.ReactNode;
  activePath?: string;
};

export function AdminLayout({ children, activePath = "" }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-slate-50/95">
      <AdminSidebar activePath={activePath} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
