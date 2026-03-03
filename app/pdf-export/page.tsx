"use client";

import { Suspense } from "react";
import { PDFExportPage } from "@/app/pages/PDFExportPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <PDFExportPage />
    </Suspense>
  );
}
