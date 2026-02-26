import * as React from "react";
import { RootLayout } from "./layouts/RootLayout";

/**
 * App shell for the UI component layer.
 * In Next.js App Router, use RootLayout in layout.tsx and render page components as children.
 */
export type AppProps = {
  children?: React.ReactNode;
  showHeaderFooter?: boolean;
};

export default function App({ children, showHeaderFooter = true }: AppProps) {
  return (
    <RootLayout showHeaderFooter={showHeaderFooter}>
      {children ?? null}
    </RootLayout>
  );
}
