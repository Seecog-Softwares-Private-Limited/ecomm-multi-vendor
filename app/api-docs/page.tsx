"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <p className="text-slate-600">Loading API docs…</p>
    </div>
  ),
});

export default function ApiDocsPage() {
  const specUrl = typeof window !== "undefined" ? `${window.location.origin}/api/openapi` : "/api/openapi";
  return (
    <SwaggerUI url={specUrl} docExpansion="list" persistAuthorization />
  );
}
