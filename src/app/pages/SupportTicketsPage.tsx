"use client";

import { Suspense } from "react";
import { AccountLayout } from "@/components/AccountLayout";
import { HelpCenterShell } from "@/components/support/HelpCenterShell";
import { HelpCenterSkeleton } from "@/components/support/SupportSkeletons";

export function SupportTicketsPage() {
  return (
    <AccountLayout>
      <div className="iv-card overflow-hidden p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<HelpCenterSkeleton />}>
          <HelpCenterShell allowGuestBrowse />
        </Suspense>
      </div>
    </AccountLayout>
  );
}
