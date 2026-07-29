"use client";

import { Suspense } from "react";
import { TopBar } from "@/components/TopBar";
import { Navbar } from "@/components/Navbar";
import { CategoryNav } from "@/components/CategoryNav";
import { HelpCenterShell } from "@/components/support/HelpCenterShell";
import { HelpCenterSkeleton } from "@/components/support/SupportSkeletons";

/** Public Help Center — same hub as /support-tickets, without account sidebar. */
export function HelpCenterPage() {
  return (
    <>
      <header className="sticky top-0 z-[80]">
        <TopBar tone="onBrand" />
        <Navbar surface="solid" />
        <CategoryNav />
      </header>
      <div className="min-h-[50vh] bg-[var(--iv-page-bg)] py-6 sm:py-10">
        <div className="iv-page">
          <div className="iv-card overflow-hidden p-4 sm:p-6 lg:p-8">
            <Suspense fallback={<HelpCenterSkeleton />}>
              <HelpCenterShell allowGuestBrowse />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
