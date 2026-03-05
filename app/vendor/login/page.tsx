import { Suspense } from "react";
import { VendorLoginPage } from "@/app/pages/vendor/VendorLoginPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <VendorLoginPage />
    </Suspense>
  );
}
