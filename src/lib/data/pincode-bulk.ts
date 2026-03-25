/**
 * Shared normalization and bulk parsing for 6-digit Indian pincodes (vendor/platform admin APIs).
 */

export function normalizeServicePincode(raw: string): string | undefined {
  const d = raw.replace(/\D/g, "").slice(0, 6);
  return /^\d{6}$/.test(d) ? d : undefined;
}

/**
 * Split pasted text by newlines, commas, semicolons; normalize each chunk to a 6-digit PIN.
 * Dedupes while preserving first-seen order.
 */
export function parseBulkPinInput(raw: string): { pincodes: string[]; invalidSamples: string[] } {
  const parts = raw
    .split(/[\n,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const pincodes: string[] = [];
  const invalidSamples: string[] = [];
  for (const p of parts) {
    const n = normalizeServicePincode(p);
    if (n) {
      if (!seen.has(n)) {
        seen.add(n);
        pincodes.push(n);
      }
      continue;
    }
    if (/\d/.test(p) && invalidSamples.length < 8) {
      invalidSamples.push(p.length > 40 ? `${p.slice(0, 40)}…` : p);
    }
  }
  return { pincodes, invalidSamples };
}
