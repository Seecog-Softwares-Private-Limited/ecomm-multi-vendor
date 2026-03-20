/**
 * Vendor profile "Business type" options (stored label or custom text in profile JSON).
 */

export const VENDOR_BUSINESS_TYPE_OPTIONS = [
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership_firm", label: "Partnership Firm" },
  { value: "private_limited_company", label: "Private Limited Company" },
  { value: "public_limited_company", label: "Public Limited Company" },
  { value: "one_person_company", label: "One Person Company" },
  { value: "llp", label: "LLP" },
  { value: "other", label: "Others" },
] as const;

/** Map saved API value → select value + optional custom text (for "Others"). */
export function parseStoredVendorBusinessType(stored: string | null | undefined): {
  value: string;
  custom: string;
} {
  const s = (stored ?? "").trim();
  if (!s) return { value: "proprietorship", custom: "" };

  const optByValue = VENDOR_BUSINESS_TYPE_OPTIONS.find((o) => o.value === s);
  if (optByValue) return { value: optByValue.value, custom: "" };

  const optByLabel = VENDOR_BUSINESS_TYPE_OPTIONS.find((o) => o.label === s);
  if (optByLabel) return { value: optByLabel.value, custom: "" };

  const legacy: Record<string, string> = {
    individual: "proprietorship",
    proprietor: "proprietorship",
    partnership: "partnership_firm",
    company: "private_limited_company",
  };
  if (legacy[s]) return { value: legacy[s], custom: "" };

  return { value: "other", custom: s };
}

/** Value sent to API: canonical label, or custom text when "Others" is selected. */
export function resolveVendorBusinessTypeForApi(value: string, custom: string): string {
  if (value === "other") {
    return custom.trim();
  }
  const opt = VENDOR_BUSINESS_TYPE_OPTIONS.find((o) => o.value === value);
  return opt?.label ?? value;
}
