import { Suspense } from "react";
import { RegisterPage } from "@/app/pages/RegisterPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">Loading…</div>}>
      <RegisterPage />
    </Suspense>
  );
}
