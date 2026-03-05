"use client";

import { Suspense } from "react";
import { AdminLoginPage } from "@/app/pages/admin/AdminLoginPage";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <AdminLoginPage onSuccess={() => router.push("/admin")} />
    </Suspense>
  );
}
