import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Manrope, Nunito, Katibeh } from "next/font/google";
import { Toaster } from "sonner";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";
import { DeliveryLocationProvider } from "@/contexts/DeliveryLocationContext";
import { AppModeProvider } from "@/contexts/AppModeContext";
import { ChunkLoadRecovery } from "@/components/ChunkLoadRecovery";

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
  title: {
    default: "IndoVyapar",
    template: "%s | IndoVyapar",
  },
  description: "IndoVyapar — multi-vendor marketplace",
};

/** App-like mobile / WebView: disable pinch-zoom (vendor + customer hybrid apps). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <ChunkLoadRecovery />
        <CartDrawerProvider>
          <AppModeProvider>
            <DeliveryLocationProvider>{children}</DeliveryLocationProvider>
          </AppModeProvider>
        </CartDrawerProvider>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
