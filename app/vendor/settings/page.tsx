import { Suspense } from "react";
import { VendorSettings } from "@/app/vendor/pages/VendorSettings";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading settings…</div>}>
      <VendorSettings />
    </Suspense>
  );
}
