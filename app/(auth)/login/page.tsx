import { Suspense } from "react";
import { LoginPage } from "@/app/pages/LoginPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">Loading…</div>}>
      <LoginPage />
    </Suspense>
  );
}
