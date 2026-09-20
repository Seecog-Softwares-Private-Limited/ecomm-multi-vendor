"use client";

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

const APP_MODE_SESSION_KEY = "indovyapar-app-mode";

type AppModeContextValue = {
  isAppMode: boolean;
};

const AppModeContext = createContext<AppModeContextValue>({ isAppMode: false });

function isTruthyAppParam(value: string | null): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function isVendorNativeShell(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.__INDOVYAPAR_NATIVE__);
}

function isVendorPath(pathname: string | null): boolean {
  return Boolean(pathname?.startsWith("/vendor"));
}

/**
 * Initial hint for first paint.
 * Never trust sticky sessionStorage on customer pages — that hid Google login on
 * iPad/iPhone Safari after any prior ?app=1 visit (portrait and landscape).
 */
function readClientAppModeHint(pathname: string | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (isVendorNativeShell()) return true;
    if (!isVendorPath(pathname)) return false;
    return window.sessionStorage.getItem(APP_MODE_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function AppModeProviderInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isAppMode, setIsAppMode] = useState(() => readClientAppModeHint(pathname));

  useEffect(() => {
    const appQueryValue = searchParams.get("app");
    const hasAppQuery = searchParams.has("app");
    const querySaysAppMode = isTruthyAppParam(appQueryValue);
    const nativeShell = isVendorNativeShell();
    const vendorPath = isVendorPath(pathname);

    if (querySaysAppMode || nativeShell) {
      try {
        window.sessionStorage.setItem(APP_MODE_SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      setIsAppMode(true);
      return;
    }

    // Explicit app=false (or any non-truthy app=) clears sticky mode.
    if (hasAppQuery) {
      try {
        window.sessionStorage.removeItem(APP_MODE_SESSION_KEY);
      } catch {
        /* ignore */
      }
      setIsAppMode(false);
      return;
    }

    // Sticky mode is only for vendor in-app navigations (URL drops ?app=1).
    // Customer Safari/iPad must never stay in app mode — that blanked Google login.
    if (!vendorPath && !nativeShell) {
      try {
        window.sessionStorage.removeItem(APP_MODE_SESSION_KEY);
      } catch {
        /* ignore */
      }
      setIsAppMode(false);
      return;
    }

    const persistedAppMode = window.sessionStorage.getItem(APP_MODE_SESSION_KEY) === "1";
    setIsAppMode(persistedAppMode);
  }, [searchParams, pathname]);

  const contextValue = useMemo(() => ({ isAppMode }), [isAppMode]);

  return <AppModeContext.Provider value={contextValue}>{children}</AppModeContext.Provider>;
}

function AppModeSuspenseFallback({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hint] = useState(() => readClientAppModeHint(pathname));
  return (
    <AppModeContext.Provider value={{ isAppMode: hint }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AppModeSuspenseFallback>{children}</AppModeSuspenseFallback>}>
      <AppModeProviderInner>{children}</AppModeProviderInner>
    </Suspense>
  );
}

export function useAppMode() {
  return useContext(AppModeContext);
}
