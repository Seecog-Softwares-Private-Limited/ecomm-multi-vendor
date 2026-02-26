import { KYCApprovalPage } from "@/app/pages/admin/KYCApprovalPage";

export default async function Page({
  params,
}: {
  params: Promise<{ sellerId: string }>;
}) {
  const { sellerId } = await params;
  return <KYCApprovalPage sellerId={sellerId} />;
}
