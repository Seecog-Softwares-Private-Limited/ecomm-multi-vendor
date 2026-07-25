import { Suspense } from "react";
import { VendorProfile } from "@/app/vendor/pages/VendorProfile";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <VendorProfile />
    </Suspense>
  );
}
