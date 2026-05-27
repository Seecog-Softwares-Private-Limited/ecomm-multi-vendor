import path from "path";

/** MIME types accepted for profile/product image uploads (incl. iOS HEIC). */
export const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  // iOS / some clients
  "image/heic-sequence",
  "image/heif-sequence",
  "application/octet-stream",
]);

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jpe": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

/** Normalize iOS / browser type strings before lookup. */
function normalizeMimeType(type: string): string {
  return type.split(";")[0]?.trim().toLowerCase() ?? "";
}

/** Resolve MIME from Content-Type header and/or filename extension. */
export function resolveImageMime(type: string, filename: string): string | null {
  const normalized = normalizeMimeType(type);
  if (normalized && normalized !== "application/octet-stream") {
    if (ALLOWED_IMAGE_MIMES.has(normalized)) {
      if (normalized === "image/jpg") return "image/jpeg";
      return normalized;
    }
  }

  const ext = path.extname(filename).toLowerCase();
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];

  // iOS often sends names like "image" or "photo" with no extension
  const base = path.basename(filename).toLowerCase();
  if (base === "image" || base === "photo" || base === "img_0001") {
    return "image/jpeg";
  }

  return null;
}

/** Detect format from file magic bytes (iOS may send empty or octet-stream type). */
export function sniffImageMimeFromBuffer(buffer: Uint8Array): string | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  ) {
    return "image/webp";
  }

  // ISO BMFF (HEIC/HEIF): ....ftypheic / mif1 / heix
  if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    const brand = String.fromCharCode(buffer[8], buffer[9], buffer[10], buffer[11]).toLowerCase();
    if (
      brand.startsWith("hei") ||
      brand === "mif1" ||
      brand === "msf1" ||
      brand === "hevc" ||
      brand === "hevx"
    ) {
      return "image/heic";
    }
  }

  return null;
}

export function resolveImageMimeWithBuffer(
  type: string,
  filename: string,
  buffer: Uint8Array
): string | null {
  return resolveImageMime(type, filename) ?? sniffImageMimeFromBuffer(buffer);
}

export function safeImageExtension(filename: string, mime: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (/^\.(jpe?g|png|webp|gif|heic|heif)$/i.test(ext)) return ext;
  if (mime.includes("png")) return ".png";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("gif")) return ".gif";
  if (mime.includes("heic") || mime.includes("heif")) return ".heic";
  return ".jpg";
}

/** Avatars are shown in all browsers — prefer JPEG extension when content is JPEG. */
export function avatarStorageExtension(filename: string, mime: string, buffer: Uint8Array): string {
  const sniffed = sniffImageMimeFromBuffer(buffer);
  if (sniffed === "image/jpeg" || mime === "image/jpeg" || mime === "image/jpg") {
    return ".jpg";
  }
  return safeImageExtension(filename, mime);
}
