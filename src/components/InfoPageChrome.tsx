"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Navbar } from "@/components/Navbar";
import { CategoryNav } from "@/components/CategoryNav";

const APP_MODE_SESSION_KEY = "indovyapar-app-mode";

function detectAppMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.__INDOVYAPAR_NATIVE__) return true;
    if (window.sessionStorage.getItem(APP_MODE_SESSION_KEY) === "1") return true;
    const app = new URLSearchParams(window.location.search).get("app");
    return app === "1" || app === "true" || app === "yes";
  } catch {
    return false;
  }
}

/**
 * Customer storefront header for public info/legal pages.
 * Hidden inside the vendor/customer native app shell so those pages don't expose
 * customer shopping navigation (category browsing, customer login) — App Store
 * Guidelines 4 / 4.8. Start hidden to avoid a flash of customer chrome.
 */
export function InfoPageChrome({ appModeHint = false }: { appModeHint?: boolean }) {
  // Server passes the `?app=1` hint so web users see the header with no flash and
  // app users never see it. The effect re-checks native/session hints for in-app
  // navigations where the query param is absent.
  const [hidden, setHidden] = useState(appModeHint);

  useEffect(() => {
    if (detectAppMode()) setHidden(true);
  }, []);

  if (hidden) return null;

  return (
    <header className="sticky top-0 z-[80]">
      <TopBar tone="onBrand" />
      <Navbar surface="solid" />
      <CategoryNav />
    </header>
  );
}
