import * as React from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export type RootLayoutProps = {
  children: React.ReactNode;
  showHeaderFooter?: boolean;
};

export function RootLayout({ children, showHeaderFooter = true }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {showHeaderFooter && <Header />}
      <main className={showHeaderFooter ? "flex-1" : "flex-1 flex items-center justify-center"}>
        {children}
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}
