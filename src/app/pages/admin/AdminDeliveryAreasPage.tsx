"use client";

import { DeliveryAreasEditor } from "@/app/components/delivery-areas/DeliveryAreasEditor";

export function AdminDeliveryAreasPage() {
  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Website delivery areas</h1>
        <p className="text-slate-600 mt-1 text-sm max-w-2xl">
          These PINs apply to the <strong>entire marketplace</strong>. When “Limit to listed PINs” is on, shoppers only see
          products if their PIN is on this list (vendors cannot override this).
        </p>
      </div>
      <DeliveryAreasEditor
        apiBaseUrl="/api/admin/platform/service-pincodes"
        voice="admin"
        showTitle={false}
      />
    </div>
  );
}
