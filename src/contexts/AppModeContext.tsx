"use client";

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

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

function readClientAppModeHint(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.__INDOVYAPAR_NATIVE__) return true;
    return window.sessionStorage.getItem(APP_MODE_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function AppModeProviderInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [isAppMode, setIsAppMode] = useState(() => readClientAppModeHint());

  useEffect(() => {
    const appQueryValue = searchParams.get("app");
    const hasAppQuery = searchParams.has("app");
    const querySaysAppMode = isTruthyAppParam(appQueryValue);
    const persistedAppMode = window.sessionStorage.getItem(APP_MODE_SESSION_KEY) === "1";
    const nativeShell = Boolean(window.__INDOVYAPAR_NATIVE__);

    if (querySaysAppMode || nativeShell) {
      window.sessionStorage.setItem(APP_MODE_SESSION_KEY, "1");
      setIsAppMode(true);
      return;
    }

    // app=false (or any non-truthy explicit value) should immediately disable app mode.
    if (hasAppQuery) {
      window.sessionStorage.removeItem(APP_MODE_SESSION_KEY);
      setIsAppMode(false);
      return;
    }

    // Preserve app mode across in-app client navigations where query is omitted.
    setIsAppMode(persistedAppMode);
  }, [searchParams]);

  const contextValue = useMemo(() => ({ isAppMode }), [isAppMode]);

  return <AppModeContext.Provider value={contextValue}>{children}</AppModeContext.Provider>;
}

/** Avoid a flash of isAppMode=false (which can expose customer Google login). */
function AppModeSuspenseFallback({ children }: { children: React.ReactNode }) {
  const [hint] = useState(() => readClientAppModeHint());
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
