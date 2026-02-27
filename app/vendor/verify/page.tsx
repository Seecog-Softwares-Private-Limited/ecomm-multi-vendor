import { Suspense } from "react";
import { VendorVerifyPage } from "@/app/pages/vendor/VendorVerifyPage";

function VerifyFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="text-sm text-slate-500">Loading…</div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VendorVerifyPage />
    </Suspense>
  );
}
