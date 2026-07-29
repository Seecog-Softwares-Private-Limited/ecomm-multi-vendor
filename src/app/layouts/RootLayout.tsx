"use client";

import * as React from "react";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { useAppMode } from "@/contexts/AppModeContext";

export type RootLayoutProps = {
  children: React.ReactNode;
  showHeaderFooter?: boolean;
};

export function RootLayout({ children, showHeaderFooter = true }: RootLayoutProps) {
  const { isAppMode } = useAppMode();
  const shouldShowWebsiteChrome = showHeaderFooter && !isAppMode;

  return (
    <div
      className={`min-h-screen flex flex-col bg-[var(--iv-page-bg)] ${
        shouldShowWebsiteChrome ? "pb-[calc(78px+env(safe-area-inset-bottom,0px))] md:pb-0" : ""
      }`}
    >
      <main className={shouldShowWebsiteChrome ? "flex-1" : "flex-1 flex items-center justify-center"}>
        {children}
      </main>
      {shouldShowWebsiteChrome ? <Footer /> : null}
      {shouldShowWebsiteChrome ? <MobileBottomNav /> : null}
    </div>
  );
}
