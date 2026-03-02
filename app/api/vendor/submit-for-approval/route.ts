import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiNotFound,
  apiBadRequest,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getVendorProfile, updateVendorProfile } from "@/lib/data/vendor-profile";
import { prisma } from "@/lib/prisma";
import {
  isProfileComplete,
  isCategoryDocumentsComplete,
  profileToValidationShape,
} from "@/lib/utils/vendorValidation";

/**
 * POST /api/vendor/submit-for-approval
 * Validates that all required profile fields and required category documents are complete, then sets vendor status to SUBMITTED.
 * Returns 400 if any required field or document is missing (backend safety check).
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }
  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) return apiNotFound("Vendor not found");

  const profile = await getVendorProfile(sellerId);
  if (!profile) return apiNotFound("Profile not found");

  const validationShape = profileToValidationShape({
    business: profile.business,
    documents: profile.documents,
    bank: profile.bank,
  });

  const gstNotApplicable = profile.business?.gstNotApplicable === true;
  if (!isProfileComplete(validationShape, gstNotApplicable)) {
    return apiBadRequest(
      "All required fields in every tab must be completed before submitting for approval. Please complete Business Info, KYC Details, and Bank Details."
    );
  }

  if (profile.primaryCategoryId) {
    const requiredDocs = await prisma.categoryDocumentRequirement.findMany({
      where: { categoryId: profile.primaryCategoryId, deletedAt: null, isRequired: true },
      select: { documentName: true },
    });
    const requiredNames = requiredDocs.map((r) => r.documentName);
    const uploadedNames = (profile.vendorDocuments ?? []).map((d) => d.documentName);
    if (!isCategoryDocumentsComplete(requiredNames, uploadedNames)) {
      return apiBadRequest(
        "Upload all required additional documents for your category in KYC Details before submitting for approval."
      );
    }
  }

  await updateVendorProfile(sellerId, { status: "submitted" });
  const updated = await getVendorProfile(sellerId);
  return apiSuccess({
    message: "Profile submitted for approval.",
    profile: updated ?? profile,
  });
});
