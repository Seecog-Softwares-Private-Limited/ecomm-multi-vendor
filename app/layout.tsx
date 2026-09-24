import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Manrope, Nunito, Katibeh } from "next/font/google";
import { Toaster } from "sonner";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";
import { DeliveryLocationProvider } from "@/contexts/DeliveryLocationContext";
import { AppModeProvider } from "@/contexts/AppModeContext";
import { ChunkLoadRecovery } from "@/components/ChunkLoadRecovery";
import { CustomerNativeSessionMarker } from "@/components/CustomerNativeSessionMarker";

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
      <head>
        {/* Runs before React hydration so stale webpack chunk mismatches can self-heal. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var K="__chunk_reload_attempted_at",W=60000;function bad(m,s){m=String(m||"");s=String(s||"");if(/ChunkLoadError/i.test(m))return true;if(/Cannot read properties of undefined \\(reading ['"]call['"]\\)/i.test(m))return !s||/webpack|__webpack_require__|requireModule|options\\.factory/i.test(s);return false;}function recover(){try{var n=Date.now(),l=Number(sessionStorage.getItem(K)||"0");if(n-l<W)return;sessionStorage.setItem(K,String(n));}catch(e){}var done=function(){location.reload();};try{if("serviceWorker" in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.all(rs.map(function(r){return r.unregister();}));}).then(function(){return"caches"in window?caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k);}));}):null;}).then(done,done);return;}}catch(e){}done();}window.addEventListener("error",function(e){if(bad(e.message,e.error&&e.error.stack))recover();});window.addEventListener("unhandledrejection",function(e){var r=e.reason;if(bad(r&&r.message||r,r&&r.stack))recover();});})();`,
          }}
        />
      </head>
      <body className={manrope.className}>
        <ChunkLoadRecovery />
        <CustomerNativeSessionMarker />
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
