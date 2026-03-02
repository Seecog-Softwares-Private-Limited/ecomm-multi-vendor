/**
 * Vendor profile completion validation.
 * Used by frontend (button disable, tab indicators) and backend (submit-for-approval).
 */

export type VendorProfileForValidation = {
  business: {
    business_name?: string | null;
    gst_number?: string | null;
    pan_number?: string | null;
    address_line1?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    store_logo?: string | null;
    store_description?: string | null;
  };
  kyc?: {
    pan_card_image?: string | null;
    gst_certificate?: string | null;
  };
  bank?: {
    account_holder_name?: string | null;
    account_number?: string | null;
    ifsc_code?: string | null;
  } | null;
};

export const TAB_NAMES = [
  "business_info",
  "kyc_details",
  "bank_details",
] as const;
export type TabName = (typeof TAB_NAMES)[number];

function nonEmpty(s: string | null | undefined): boolean {
  return typeof s === "string" && s.trim().length > 0;
}

/** Business Info: business_name, pan_number; gst_number required unless gstNotApplicable */
export function isBusinessInfoComplete(
  profile: VendorProfileForValidation,
  gstNotApplicable?: boolean
): boolean {
  const b = profile.business ?? {};
  const hasGst = gstNotApplicable || nonEmpty(b.gst_number);
  return nonEmpty(b.business_name) && nonEmpty(b.pan_number) && hasGst;
}

/** KYC Details: pan_card_image required; gst_certificate required unless gstNotApplicable */
export function isKycDetailsComplete(
  profile: VendorProfileForValidation,
  gstNotApplicable?: boolean
): boolean {
  const k = profile.kyc ?? {};
  const hasPan = nonEmpty(k.pan_card_image);
  const hasGstCert = gstNotApplicable || nonEmpty(k.gst_certificate);
  return hasPan && hasGstCert;
}

/** Bank Details: account_holder_name, account_number, ifsc_code */
export function isBankDetailsComplete(profile: VendorProfileForValidation): boolean {
  const bank = profile.bank;
  if (!bank) return false;
  return (
    nonEmpty(bank.account_holder_name) &&
    nonEmpty(bank.account_number) &&
    nonEmpty(bank.ifsc_code)
  );
}

/**
 * Returns true if all required category documents (for vendor's primary category) are uploaded.
 * Pass empty arrays if no primary category or no required docs.
 * Comparison is case-insensitive and trims whitespace to avoid mismatches.
 */
export function isCategoryDocumentsComplete(
  requiredDocumentNames: string[],
  uploadedDocumentNames: string[]
): boolean {
  if (requiredDocumentNames.length === 0) return true;
  const normalize = (s: string) => s.trim().toLowerCase();
  const uploadedSet = new Set(
    uploadedDocumentNames.map((n) => normalize(n)).filter(Boolean)
  );
  return requiredDocumentNames.every((name) => uploadedSet.has(normalize(name)));
}

/**
 * Returns true only if all required fields in all tabs are non-empty (no format validation here).
 * Does not include category document requirements; combine with isCategoryDocumentsComplete when needed.
 */
export function isProfileComplete(
  profile: VendorProfileForValidation,
  gstNotApplicable?: boolean
): boolean {
  return (
    isBusinessInfoComplete(profile, gstNotApplicable) &&
    isKycDetailsComplete(profile, gstNotApplicable) &&
    isBankDetailsComplete(profile)
  );
}

/**
 * Tab-level completion for indicators.
 * Pass gstNotApplicable for business_info when "GST not applicable" is checked.
 */
export function isTabComplete(
  tabName: TabName,
  profile: VendorProfileForValidation,
  gstNotApplicable?: boolean
): boolean {
  switch (tabName) {
    case "business_info":
      return isBusinessInfoComplete(profile, gstNotApplicable);
    case "kyc_details":
      return isKycDetailsComplete(profile, gstNotApplicable);
    case "bank_details":
      return isBankDetailsComplete(profile);
    default:
      return false;
  }
}

/**
 * Normalize API profile shape to VendorProfileForValidation.
 * Maps displayName -> business_name, gstin -> gst_number, pan -> pan_number, etc.
 */
export function profileToValidationShape(apiProfile: {
  business?: {
    displayName?: string | null;
    legalName?: string | null;
    pan?: string | null;
    gstin?: string | null;
    addressLine1?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    storeLogo?: string | null;
    storeDescription?: string | null;
  };
  documents?: { documentType: string; fileUrl?: string | null }[];
  bank?: {
    accountHolderName?: string | null;
    accountNumber?: string | null;
    ifsc?: string | null;
  } | null;
}): VendorProfileForValidation {
  const business = apiProfile.business ?? {};
  const docs = apiProfile.documents ?? [];
  const panDoc = docs.find((d) => d.documentType === "PAN");
  const gstDoc = docs.find((d) => d.documentType === "GST_CERTIFICATE");
  const bank = apiProfile.bank;

  return {
    business: {
      business_name: business.displayName ?? business.legalName ?? null,
      gst_number: business.gstin ?? null,
      pan_number: business.pan ?? null,
      address_line1: business.addressLine1 ?? null,
      city: business.city ?? null,
      state: business.state ?? null,
      pincode: business.pincode ?? null,
      store_logo: business.storeLogo ?? null,
      store_description: business.storeDescription ?? null,
    },
    kyc: {
      pan_card_image: panDoc?.fileUrl ?? null,
      gst_certificate: gstDoc?.fileUrl ?? null,
    },
    bank: bank
      ? {
          account_holder_name: bank.accountHolderName ?? null,
          account_number: bank.accountNumber ?? null,
          ifsc_code: bank.ifsc ?? null,
        }
      : null,
  };
}

