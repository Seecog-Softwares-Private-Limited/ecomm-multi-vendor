import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";

export const metadata: Metadata = {
  title: "E-commerce Website Wireframes",
  description: "MarketHub - Multi-Vendor Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartDrawerProvider>
          {children}
        </CartDrawerProvider>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
