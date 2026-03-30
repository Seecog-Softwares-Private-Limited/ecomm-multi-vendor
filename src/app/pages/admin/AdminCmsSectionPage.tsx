"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCmsFooterSection, isStaticStorefrontFooterSlug } from "@/lib/cms-footer-pages";

export function AdminCmsSectionPage() {
  const params = useParams();
  const sectionId = typeof params.sectionId === "string" ? params.sectionId : "";
  const section = getCmsFooterSection(sectionId);

  if (!section) {
    return (
      <div className="p-6 sm:p-8">
        <p className="text-slate-600">Section not found.</p>
        <Link href="/admin/cms" className="mt-4 inline-block text-amber-700 font-medium text-sm hover:underline">
          Back to CMS
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <Link
        href="/admin/cms"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-amber-700 mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        All sections
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{section.title}</h1>
      <p className="mt-1 text-sm text-slate-600 mb-8">Choose a page to edit.</p>

      <ul className="flex flex-col gap-2">
        {section.pages.map((page) => (
          <li key={page.slug}>
            {page.slug === "careers" ? (
              <Link
                href="/admin/cms/career-openings"
                className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm transition hover:border-amber-300/60 hover:shadow"
              >
                <div>
                  <span className="font-medium text-slate-800">Careers</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Job openings on the storefront Careers page
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600" />
              </Link>
            ) : isStaticStorefrontFooterSlug(page.slug) ? (
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
                <div>
                  <span className="font-medium text-slate-800">{page.label}</span>
                  <p className="text-xs text-slate-500 mt-0.5">Built-in page — edit in code, not in CMS</p>
                </div>
              </div>
            ) : (
              <Link
                href={`/admin/cms/edit/${page.slug}`}
                className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm transition hover:border-amber-300/60 hover:shadow"
              >
                <span className="font-medium text-slate-800">{page.label}</span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
