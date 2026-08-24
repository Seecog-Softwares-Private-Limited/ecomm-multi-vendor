import type { Metadata } from "next";
import { Suspense } from "react";
import { VendorLoginPage } from "@/app/pages/vendor/VendorLoginPage";

export const metadata: Metadata = {
  title: "Vendor Sign In",
  description: "Sign in to the IndoVyapar Vendor App to manage your seller account.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <VendorLoginPage />
    </Suspense>
  );
}
