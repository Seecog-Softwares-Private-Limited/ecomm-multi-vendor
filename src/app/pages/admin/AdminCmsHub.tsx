"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CMS_FOOTER_SECTIONS } from "@/lib/cms-footer-pages";

export function AdminCmsHub() {
  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CMS</h1>
        <p className="mt-1 text-sm text-slate-600">
          Edit footer information pages. Content is shown when customers open the matching link in the site footer.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {CMS_FOOTER_SECTIONS.map((section) => (
          <li key={section.id}>
            <Link
              href={`/admin/cms/${section.id}`}
              className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm transition hover:border-amber-300/60 hover:shadow-md"
            >
              <div>
                <p className="font-semibold text-slate-900">{section.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {section.pages.length} pages
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
