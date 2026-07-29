"use client";

import { Suspense, useEffect, useState } from "react";
import { AccountLayout } from "@/components/AccountLayout";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { NotificationListSkeleton } from "@/components/notifications/NotificationSkeletons";

export function NotificationsPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setIsLoggedIn(Boolean(data?.data?.user && data.data.user.role === "CUSTOMER"));
      })
      .catch(() => setIsLoggedIn(false))
      .finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return (
      <AccountLayout>
        <div className="iv-card p-4 sm:p-6">
          <NotificationListSkeleton />
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="iv-card iv-fade-in overflow-hidden p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<NotificationListSkeleton />}>
          <NotificationCenter isLoggedIn={isLoggedIn} />
        </Suspense>
      </div>
    </AccountLayout>
  );
}
