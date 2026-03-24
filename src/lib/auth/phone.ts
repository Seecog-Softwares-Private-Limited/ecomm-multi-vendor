/**
 * Normalize Indian mobile numbers to digits-only country code + national number (e.g. 919876543210).
 */

const MOBILE_FIRST = /^[6-9]\d{9}$/;

/** Strip bidi / invisible chars; NFKC fixes fullwidth digits etc. */
function sanitizePhoneInput(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, "")
    .trim();
}

/** Keep only decimal digits, mapping common Unicode digit blocks to ASCII 0-9. */
function extractAsciiDigits(s: string): string {
  const out: string[] = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (cp >= 0x30 && cp <= 0x39) {
      out.push(ch);
      continue;
    }
    if (cp >= 0xff10 && cp <= 0xff19) {
      out.push(String.fromCodePoint(cp - 0xff10 + 0x30));
      continue;
    }
    if (cp >= 0x0660 && cp <= 0x0669) {
      out.push(String.fromCodePoint(cp - 0x0660 + 0x30));
      continue;
    }
    if (cp >= 0x06f0 && cp <= 0x06f9) {
      out.push(String.fromCodePoint(cp - 0x06f0 + 0x30));
      continue;
    }
    if (cp >= 0x0966 && cp <= 0x096f) {
      out.push(String.fromCodePoint(cp - 0x0966 + 0x30));
      continue;
    }
  }
  return out.join("");
}

export function normalizeIndianPhone(input: string): string | null {
  const cleaned = sanitizePhoneInput(input);
  const digits = extractAsciiDigits(cleaned);

  if (digits.length === 10 && MOBILE_FIRST.test(digits)) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91") && MOBILE_FIRST.test(digits.slice(2))) {
    return digits;
  }
  if (
    digits.length === 11 &&
    digits.startsWith("0") &&
    MOBILE_FIRST.test(digits.slice(1))
  ) {
    return `91${digits.slice(1)}`;
  }
  return null;
}

/** User-facing hint when normalization fails. */
export const INDIAN_MOBILE_HINT =
  "Use 10 digits starting with 6, 7, 8, or 9 (do not add +91 in the middle). Example: 9876543210.";

export function phoneNormToE164(phoneNorm: string): string {
  return `+${phoneNorm}`;
}

/** Placeholder email so password-based schema stays satisfied for phone-only signups. */
export function syntheticEmailForPhoneNorm(phoneNorm: string): string {
  return `${phoneNorm}@phone-otp.indovyapar.local`;
}
