import { SubCategoryListingPage } from "@/app/pages/SubCategoryListingPage";

export default async function Page({
  params,
}: {
  params: Promise<{ categoryName: string; subCategoryName: string }>;
}) {
  const { categoryName, subCategoryName } = await params;
  return (
    <SubCategoryListingPage
      categoryName={categoryName}
      subCategoryName={subCategoryName}
    />
  );
}
