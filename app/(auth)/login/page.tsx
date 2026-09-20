import { Suspense } from "react";
import Script from "next/script";
import { LoginPage } from "@/app/pages/LoginPage";

export default function Page() {
  return (
    <>
      {/* Clear sticky vendor app-mode before hydrate — fixes missing Google on iPad Safari */}
      <Script id="clear-customer-app-mode" strategy="beforeInteractive">
        {`try{if(typeof window!=="undefined"&&!window.__INDOVYAPAR_NATIVE__){sessionStorage.removeItem("indovyapar-app-mode");}}catch(e){}`}
      </Script>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
            Loading…
          </div>
        }
      >
        <LoginPage />
      </Suspense>
    </>
  );
}
