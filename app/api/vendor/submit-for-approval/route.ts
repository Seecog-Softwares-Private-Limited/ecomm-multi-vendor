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
  isBusinessInfoComplete,
  isKycDetailsComplete,
  isBankDetailsComplete,
  isCategoryDocumentsComplete,
  profileToValidationShape,
} from "@/lib/utils/vendorValidation";

/**
 * POST /api/vendor/submit-for-approval
 * Validates that all required profile fields and required category documents are complete, then sets vendor status to SUBMITTED.
 * Returns 400 with a specific list of missing sections if validation fails.
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
  const businessComplete = isBusinessInfoComplete(validationShape, gstNotApplicable);
  const kycComplete = isKycDetailsComplete(validationShape, gstNotApplicable);
  const bankComplete = isBankDetailsComplete(validationShape);

  const missing: string[] = [];
  if (!businessComplete) missing.push("Business Info (business name, PAN, and GST number or mark GST not applicable)");
  if (!kycComplete) missing.push("KYC Details (upload PAN card and GST certificate, or mark GST not applicable)");
  if (!bankComplete) missing.push("Bank Details (account holder name, account number, IFSC)");

  if (profile.primaryCategoryId) {
    const requiredDocs = await prisma.categoryDocumentRequirement.findMany({
      where: { categoryId: profile.primaryCategoryId, deletedAt: null, isRequired: true },
      select: { documentName: true },
    });
    const requiredNames = requiredDocs.map((r) => r.documentName);
    const uploadedNames = (profile.vendorDocuments ?? []).map((d) => d.documentName);
    if (!isCategoryDocumentsComplete(requiredNames, uploadedNames)) {
      const missingDocs = requiredNames.filter(
        (n) => !uploadedNames.some((u) => u.trim().toLowerCase() === n.trim().toLowerCase())
      );
      missing.push(
        missingDocs.length > 0
          ? `Category documents: upload required "${missingDocs.join('", "')}" in KYC Details`
          : "Category documents: upload all required documents for your primary category in KYC Details"
      );
    }
  }

  if (missing.length > 0) {
    const message =
      "Complete the following before submitting: " +
      missing.join(". ") +
      ".";
    return apiBadRequest(message, { missing });
  }

  await updateVendorProfile(sellerId, { status: "submitted" });
  const updated = await getVendorProfile(sellerId);
  return apiSuccess({
    message: "Profile submitted for approval.",
    profile: updated ?? profile,
  });
});
