"use client";

import { VendorProductForm } from "@/app/vendor/pages/VendorProductForm";
import { useRouter, useParams } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId as string | undefined;
  return (
    <VendorProductForm
      productId={productId}
      onBack={() => router.push("/vendor/products")}
      onSave={() => router.push("/vendor/products")}
    />
  );
}
