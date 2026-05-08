"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
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

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [isAppMode, setIsAppMode] = useState(false);

  useEffect(() => {
    const appQueryValue = searchParams.get("app");
    const hasAppQuery = searchParams.has("app");
    const querySaysAppMode = isTruthyAppParam(appQueryValue);
    const persistedAppMode = window.sessionStorage.getItem(APP_MODE_SESSION_KEY) === "1";

    if (querySaysAppMode) {
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

export function useAppMode() {
  return useContext(AppModeContext);
}
