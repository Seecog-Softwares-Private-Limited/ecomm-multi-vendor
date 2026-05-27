import path from "path";

/** MIME types accepted for profile/product image uploads. */
export const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

/** Resolve MIME from type header and/or filename extension. */
export function resolveImageMime(type: string, filename: string): string | null {
  const normalized = type.split(";")[0]?.trim().toLowerCase();
  if (normalized && ALLOWED_IMAGE_MIMES.has(normalized)) return normalized;
  const ext = path.extname(filename).toLowerCase();
  return EXT_TO_MIME[ext] ?? null;
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
