"use client";

import { useEffect, useState } from "react";
import { VendorGatekeeping } from "@/app/vendor/pages/VendorGatekeeping";
import { vendorService } from "@/services/vendor.service";

export default function GatekeepingPage() {
  const [status, setStatus] = useState<"draft" | "submitted" | "approved" | "rejected" | "suspended" | "on_hold" | null>(null);
  const [statusReason, setStatusReason] = useState<string | undefined>(undefined);

  useEffect(() => {
    vendorService
      .getProfile()
      .then((profile) => {
        setStatus(profile.status);
        setStatusReason(profile.statusReason ?? undefined);
      })
      .catch(() => setStatus("draft"));
  }, []);

  return (
    <VendorGatekeeping
      status={status ?? "draft"}
      statusReason={statusReason}
      rejectionReason={statusReason}
      suspensionReason={statusReason}
    />
  );
}
