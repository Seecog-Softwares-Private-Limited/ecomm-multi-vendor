"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VendorStatusCard } from "@/app/vendor/components/VendorStatusCard";
import type { VendorStatusDisplay } from "@/lib/auth";

const VENDOR_LOGIN_PATH = "/vendor/login";

type MeResponse = {
  vendorId: string;
  email: string;
  role: string;
  status: VendorStatusDisplay;
  statusReason: string | null;
  businessName: string | null;
};

export default function VendorStatusPage() {
  const router = useRouter();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/vendor/me", { credentials: "include" })
      .then((res) => {
        if (cancelled) return;
        if (res.status === 401 || res.status === 403) {
          router.replace(`${VENDOR_LOGIN_PATH}?callbackUrl=${encodeURIComponent("/vendor/status")}`);
          return;
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled || !json?.success) return;
        setData(json.data as MeResponse);
      })
      .catch(() => {
        if (!cancelled) router.replace(VENDOR_LOGIN_PATH);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-50/80 to-white">
        <div
          className="h-11 w-11 animate-spin rounded-xl border-2 border-slate-200 border-t-slate-700"
          aria-hidden
        />
        <p className="text-sm font-medium text-slate-500">Loading your status…</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50">
      <VendorStatusCard
        status={data.status}
        statusReason={data.statusReason}
        businessName={data.businessName}
      />
    </div>
  );
}
