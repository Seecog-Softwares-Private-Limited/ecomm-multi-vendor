import { Suspense } from "react";
import { VendorRegisterPage } from "@/app/pages/vendor/VendorRegisterPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <VendorRegisterPage />
    </Suspense>
  );
}
