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

/** Indian PAN: ABCDE1234F */
export const PAN_FORMAT_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** Indian IFSC: 4 letters + 0 + 6 alphanumeric (e.g. SBIN0001234) */
export const IFSC_FORMAT_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** Indian bank account: 9–18 digits */
export const BANK_ACCOUNT_FORMAT_REGEX = /^[0-9]{9,18}$/;

/**
 * Indian GSTIN: 15 characters — state code (2) + PAN (10) + entity (1) + Z + check digit (1).
 * e.g. 27ABCDE1234F1Z5
 */
export const GSTIN_FORMAT_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const GSTIN_CHECKSUM_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const GSTIN_CHECKSUM_WEIGHTS = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2] as const;

export function normalizePan(value: string): string {
  return value.replace(/\s/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

export function normalizeIfsc(value: string): string {
  return value.replace(/\s/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
}

export function normalizeBankAccountNumber(value: string): string {
  return value.replace(/\s/g, "").replace(/\D/g, "").slice(0, 18);
}

export function normalizeGstin(value: string): string {
  return value.replace(/\s/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
}

function gstinCharValue(char: string): number {
  const index = GSTIN_CHECKSUM_CHARS.indexOf(char);
  return index >= 0 ? index : -1;
}

function isValidGstinStateCode(stateCode: string): boolean {
  const code = Number.parseInt(stateCode, 10);
  if (!Number.isFinite(code)) return false;
  return (code >= 1 && code <= 37) || code === 96 || code === 97;
}

function isValidGstinChecksum(gstin: string): boolean {
  if (gstin.length !== 15) return false;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const value = gstinCharValue(gstin[i] ?? "");
    if (value < 0) return false;
    const product = value * GSTIN_CHECKSUM_WEIGHTS[i];
    sum += Math.floor(product / 36) + (product % 36);
  }
  const checkDigitIndex = (36 - (sum % 36)) % 36;
  return gstin[14] === GSTIN_CHECKSUM_CHARS[checkDigitIndex];
}

export function getGstinFormatError(gstin: string | null | undefined): string | null {
  const normalized = normalizeGstin(gstin ?? "");
  if (!normalized) return null;

  if (normalized.length !== 15) {
    return "GSTIN must be exactly 15 characters (e.g. 27ABCDE1234F1Z0)";
  }

  if (!isValidGstinStateCode(normalized.slice(0, 2))) {
    return "GSTIN must start with a valid 2-digit state code (01–37, 96, or 97)";
  }

  if (!GSTIN_FORMAT_REGEX.test(normalized)) {
    return "GSTIN format is invalid. Use: state code + PAN + entity + Z + check digit (e.g. 27ABCDE1234F1Z0)";
  }

  if (!isValidGstinChecksum(normalized)) {
    return "GSTIN check digit is invalid. Please verify the number.";
  }

  return null;
}

export function getGstinPanMismatchError(
  gstin: string | null | undefined,
  pan: string | null | undefined
): string | null {
  const normalizedGstin = normalizeGstin(gstin ?? "");
  const normalizedPan = normalizePan(pan ?? "");
  if (normalizedGstin.length !== 15 || normalizedPan.length !== 10) return null;
  if (normalizedGstin.slice(2, 12) !== normalizedPan) {
    return "Characters 3–12 of GSTIN must match your PAN number";
  }
  return null;
}

export function getPanFormatError(pan: string | null | undefined): string | null {
  const normalized = normalizePan(pan ?? "");
  if (!normalized) return null;
  if (!PAN_FORMAT_REGEX.test(normalized)) {
    return "PAN must be in format ABCDE1234F (5 letters, 4 digits, 1 letter)";
  }
  return null;
}

export function getIfscFormatError(ifsc: string | null | undefined): string | null {
  const normalized = normalizeIfsc(ifsc ?? "");
  if (!normalized) return null;
  if (!IFSC_FORMAT_REGEX.test(normalized)) {
    return "IFSC must be 11 characters, e.g. SBIN0001234 (4 letters, 0, then 6 characters)";
  }
  return null;
}

export function getBankAccountFormatError(account: string | null | undefined): string | null {
  const normalized = normalizeBankAccountNumber(account ?? "");
  if (!normalized) return null;
  if (!BANK_ACCOUNT_FORMAT_REGEX.test(normalized)) {
    return "Account number must be 9 to 18 digits";
  }
  return null;
}

export type VendorFinancialFieldErrors = {
  pan?: string;
  gstin?: string;
  ifsc?: string;
  accountNumber?: string;
};

/** Validate PAN / GST / bank fields when present. Set requireFilled to enforce non-empty + format. */
export function validateVendorFinancialFields(
  input: {
    pan?: string | null;
    gstin?: string | null;
    ifsc?: string | null;
    accountNumber?: string | null;
  },
  opts?: { requireFilled?: boolean; gstNotApplicable?: boolean }
): VendorFinancialFieldErrors {
  const errors: VendorFinancialFieldErrors = {};
  const requireFilled = opts?.requireFilled ?? false;
  const gstNotApplicable = opts?.gstNotApplicable ?? false;

  const panNorm = normalizePan(input.pan ?? "");
  if (requireFilled && !panNorm) {
    errors.pan = "PAN is required";
  } else {
    const panErr = getPanFormatError(panNorm);
    if (panErr) errors.pan = panErr;
  }

  const gstNorm = normalizeGstin(input.gstin ?? "");
  if (!gstNotApplicable) {
    if (requireFilled && !gstNorm) {
      errors.gstin = "GST number is required (or mark GST not applicable)";
    } else if (gstNorm) {
      const gstErr = getGstinFormatError(gstNorm);
      if (gstErr) {
        errors.gstin = gstErr;
      } else {
        const panMismatchErr = getGstinPanMismatchError(gstNorm, panNorm);
        if (panMismatchErr) errors.gstin = panMismatchErr;
      }
    }
  }

  const ifscNorm = normalizeIfsc(input.ifsc ?? "");
  if (requireFilled && !ifscNorm) {
    errors.ifsc = "IFSC code is required";
  } else {
    const ifscErr = getIfscFormatError(ifscNorm);
    if (ifscErr) errors.ifsc = ifscErr;
  }

  const acctNorm = normalizeBankAccountNumber(input.accountNumber ?? "");
  if (requireFilled && !acctNorm) {
    errors.accountNumber = "Account number is required";
  } else {
    const acctErr = getBankAccountFormatError(acctNorm);
    if (acctErr) errors.accountNumber = acctErr;
  }

  return errors;
}

export function hasVendorFinancialFieldErrors(errors: VendorFinancialFieldErrors): boolean {
  return Boolean(errors.pan || errors.gstin || errors.ifsc || errors.accountNumber);
}

/** Business Info: business_name, pan_number; gst_number required unless gstNotApplicable */
export function isBusinessInfoComplete(
  profile: VendorProfileForValidation,
  gstNotApplicable?: boolean
): boolean {
  const b = profile.business ?? {};
  const panOk = nonEmpty(b.pan_number) && !getPanFormatError(b.pan_number);
  const gstOk =
    gstNotApplicable ||
    (nonEmpty(b.gst_number) &&
      !getGstinFormatError(b.gst_number) &&
      !getGstinPanMismatchError(b.gst_number, b.pan_number));
  return nonEmpty(b.business_name) && panOk && gstOk;
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
    !getBankAccountFormatError(bank.account_number) &&
    nonEmpty(bank.ifsc_code) &&
    !getIfscFormatError(bank.ifsc_code)
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

