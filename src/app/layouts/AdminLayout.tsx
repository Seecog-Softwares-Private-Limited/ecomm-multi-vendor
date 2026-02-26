import * as React from "react";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminHeader } from "../components/admin/AdminHeader";

export type AdminLayoutProps = {
  children: React.ReactNode;
  activePath?: string;
};

export function AdminLayout({ children, activePath = "" }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activePath={activePath} />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
