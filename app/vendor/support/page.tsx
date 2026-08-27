import { Suspense } from "react";
import { VendorSupport } from "@/app/vendor/pages/VendorSupport";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#3B82F6] border-t-transparent" />
        </div>
      }
    >
      <VendorSupport />
    </Suspense>
  );
}
