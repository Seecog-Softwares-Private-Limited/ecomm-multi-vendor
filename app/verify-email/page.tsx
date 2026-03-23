import { Suspense } from "react";
import { CustomerVerifyPage } from "@/app/pages/CustomerVerifyPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">Loading…</div>
      }
    >
      <CustomerVerifyPage />
    </Suspense>
  );
}
