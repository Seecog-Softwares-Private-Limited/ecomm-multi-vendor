import { Suspense } from "react";
import { SellerManagement } from "@/app/pages/admin/SellerManagement";

export default function Page() {
  return (
    <Suspense>
      <SellerManagement />
    </Suspense>
  );
}
