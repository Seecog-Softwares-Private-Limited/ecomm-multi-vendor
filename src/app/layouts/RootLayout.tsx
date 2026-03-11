import * as React from "react";

export type RootLayoutProps = {
  children: React.ReactNode;
  showHeaderFooter?: boolean;
};

export function RootLayout({ children, showHeaderFooter = true }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className={showHeaderFooter ? "flex-1" : "flex-1 flex items-center justify-center"}>
        {children}
      </main>
    </div>
  );
}
