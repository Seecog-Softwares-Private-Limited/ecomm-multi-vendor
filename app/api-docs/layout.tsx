import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Docs | Indovypar",
  description: "OpenAPI documentation for Indovypar multi-vendor API",
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="text-lg font-semibold text-slate-800">
            Indovypar API Docs
          </a>
          <a
            href="/api/openapi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            OpenAPI JSON
          </a>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
