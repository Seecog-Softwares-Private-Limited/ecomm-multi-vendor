import path from "node:path";
import { existsSync } from "node:fs";

/**
 * Absolute path to `public/uploads` (KYC, vendor-docs, product images).
 *
 * On production (PM2, systemd), `process.cwd()` is often wrong — set:
 *   PUBLIC_UPLOAD_ROOT=/full/path/to/your/project/public/uploads
 *
 * Standalone (`output: 'standalone'`): cwd is usually `.next/standalone` and
 * `public/` is copied next to it; default `join(cwd, 'public', 'uploads')` works.
 */
export function getPublicUploadsRoot(): string {
  const fromEnv = process.env.PUBLIC_UPLOAD_ROOT?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }
  return path.resolve(process.cwd(), "public", "uploads");
}

/** Subdirs under public/uploads */
export function getKycUploadDir(): string {
  return path.join(getPublicUploadsRoot(), "kyc");
}

export function getVendorDocsUploadDir(): string {
  return path.join(getPublicUploadsRoot(), "vendor-docs");
}

export function getAvatarsUploadDir(): string {
  return path.join(getPublicUploadsRoot(), "avatars");
}
