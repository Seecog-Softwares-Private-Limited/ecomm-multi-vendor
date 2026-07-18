import { Suspense } from "react";
import { CompleteProfilePage } from "@/app/pages/CompleteProfilePage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">Loading…</div>
      }
    >
      <CompleteProfilePage />
    </Suspense>
  );
}
