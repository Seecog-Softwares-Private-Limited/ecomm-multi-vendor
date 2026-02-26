"use client";

import { VendorOrderDetail } from "@/app/vendor/pages/VendorOrderDetail";
import { useRouter, useParams } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string | undefined;
  return (
    <VendorOrderDetail
      orderId={orderId}
      onBack={() => router.push("/vendor/orders")}
    />
  );
}
