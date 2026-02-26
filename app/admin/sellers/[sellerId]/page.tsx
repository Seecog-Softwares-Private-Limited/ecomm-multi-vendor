import { SellerDetailPage } from "@/app/pages/admin/SellerDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ sellerId: string }>;
}) {
  const { sellerId } = await params;
  return <SellerDetailPage sellerId={sellerId} />;
}
