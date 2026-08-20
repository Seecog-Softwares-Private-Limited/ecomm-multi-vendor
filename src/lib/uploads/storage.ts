import path from "node:path";

/**
 * Absolute path to product/KYC/avatar uploads.
 *
 * On production (PM2 + GitHub rsync deploy), NEVER store uploads only under the
 * app tree's `public/uploads` without excluding that path from rsync --delete —
 * each deploy would wipe every vendor image (HTTP 404 on /uploads/*).
 *
 * Prefer an absolute path outside the deploy directory, e.g.:
 *   PUBLIC_UPLOAD_ROOT=/home/bitnami/projects/data/ecomm-uploads
 *
 * ecosystem.config.cjs sets a sibling `../data/ecomm-uploads` by default.
 * Fallback when unset: `join(cwd, 'public', 'uploads')` (OK for local dev only).
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
