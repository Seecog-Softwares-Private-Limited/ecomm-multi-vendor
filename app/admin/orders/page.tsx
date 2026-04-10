import { Suspense } from "react";
import { OrdersManagement } from "@/app/pages/admin/OrdersManagement";

export default function Page() {
  return (
    <Suspense>
      <OrdersManagement />
    </Suspense>
  );
}
