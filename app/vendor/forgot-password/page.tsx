import { Suspense } from "react";
import { VendorForgotPasswordPage } from "@/app/pages/vendor/VendorForgotPasswordPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <VendorForgotPasswordPage />
    </Suspense>
  );
}
