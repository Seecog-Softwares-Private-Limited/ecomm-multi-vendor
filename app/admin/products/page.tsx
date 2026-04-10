import { Suspense } from "react";
import { ProductModeration } from "@/app/pages/admin/ProductModeration";

export default function Page() {
  return (
    <Suspense>
      <ProductModeration />
    </Suspense>
  );
}
