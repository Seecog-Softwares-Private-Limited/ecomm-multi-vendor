"use client";

import { VendorProductForm } from "@/app/vendor/pages/VendorProductForm";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <VendorProductForm
      onBack={() => router.push("/vendor/products")}
      onSave={() => router.push("/vendor/products")}
    />
  );
}
