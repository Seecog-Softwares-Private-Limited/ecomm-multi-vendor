import type { Metadata } from "next";
import "./globals.css";
import { Manrope, Nunito, Katibeh } from "next/font/google";
import { Toaster } from "sonner";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-nunito",
});

const katibeh = Katibeh({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-katibeh",
});

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
    <html
      lang="en"
      className={`${manrope.variable} ${nunito.variable} ${katibeh.variable}`}
    >
      <body className={manrope.className}>
        <CartDrawerProvider>
          {children}
        </CartDrawerProvider>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
