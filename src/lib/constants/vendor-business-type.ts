/**
 * Vendor profile business / product line — simplified to "Other" for products outside listed categories.
 */

export const VENDOR_BUSINESS_TYPE_OPTIONS = [{ value: "other", label: "Other" }] as const;

/** Map saved API value → select value + optional custom text. */
export function parseStoredVendorBusinessType(stored: string | null | undefined): {
  value: string;
  custom: string;
} {
  const s = (stored ?? "").trim();
  if (!s) return { value: "other", custom: "" };

  const optByValue = VENDOR_BUSINESS_TYPE_OPTIONS.find((o) => o.value === s);
  if (optByValue) return { value: optByValue.value, custom: "" };

  if (s.toLowerCase() === "other" || s.toLowerCase() === "others") {
    return { value: "other", custom: "" };
  }

  // Legacy legal-entity labels and any custom text → Other + description
  return { value: "other", custom: s };
}

/** Value sent to API: custom description for products / business not in listed categories. */
export function resolveVendorBusinessTypeForApi(value: string, custom: string): string {
  const text = custom.trim();
  if (text) return text;
  if (value === "other") return "Other";
  const opt = VENDOR_BUSINESS_TYPE_OPTIONS.find((o) => o.value === value);
  return opt?.label ?? "Other";
}
