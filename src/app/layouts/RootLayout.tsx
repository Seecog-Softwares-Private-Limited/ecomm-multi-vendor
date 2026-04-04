import * as React from "react";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";

export type RootLayoutProps = {
  children: React.ReactNode;
  showHeaderFooter?: boolean;
};

export function RootLayout({ children, showHeaderFooter = true }: RootLayoutProps) {
  return (
    <div
      className={`min-h-screen bg-white flex flex-col ${
        showHeaderFooter ? "pb-[calc(78px+env(safe-area-inset-bottom,0px))] md:pb-0" : ""
      }`}
    >
      <main className={showHeaderFooter ? "flex-1" : "flex-1 flex items-center justify-center"}>
        {children}
      </main>
      {showHeaderFooter ? <Footer /> : null}
      {showHeaderFooter ? <MobileBottomNav /> : null}
    </div>
  );
}
