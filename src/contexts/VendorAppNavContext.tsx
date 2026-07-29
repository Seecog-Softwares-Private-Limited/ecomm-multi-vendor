"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { useAppMode } from "@/contexts/AppModeContext";
import { vendorNavigateTargetMode } from "@/lib/vendor-app-navigation";

type VendorAppNavContextValue = {
  isHybridApp: boolean;
  navigateVendor: (href: string) => void;
};

const VendorAppNavContext = createContext<VendorAppNavContextValue>({
  isHybridApp: false,
  navigateVendor: () => {},
});

export function VendorAppNavProvider({
  children,
  /** When false (login/register), skip global link interception. */
  enabled = true,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  const router = useRouter();
  const { isAppMode } = useAppMode();
  const isHybridApp = enabled && isAppMode;

  const navigateVendor = useCallback(
    (href: string) => {
      if (!isHybridApp) {
        router.push(href);
        return;
      }
      if (vendorNavigateTargetMode(href) === "replace") {
        router.replace(href);
      } else {
        router.push(href);
      }
    },
    [isHybridApp, router],
  );

  /** Intercept vendor tab links so dashboard cards, sidebar, etc. do not stack history. */
  useEffect(() => {
    if (!isHybridApp) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || !rawHref.startsWith("/vendor")) return;

      const mode = vendorNavigateTargetMode(rawHref);
      if (mode !== "replace") return;

      event.preventDefault();
      router.replace(rawHref);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [isHybridApp, router]);

  const value = useMemo(
    () => ({ isHybridApp, navigateVendor }),
    [isHybridApp, navigateVendor],
  );

  return (
    <VendorAppNavContext.Provider value={value}>
      {children}
    </VendorAppNavContext.Provider>
  );
}

export function useVendorAppNav() {
  return useContext(VendorAppNavContext);
}
