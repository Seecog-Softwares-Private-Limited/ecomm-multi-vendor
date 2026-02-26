"use client";

import { AdminLoginPage } from "@/app/pages/admin/AdminLoginPage";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return <AdminLoginPage onSuccess={() => router.push("/admin")} />;
}
