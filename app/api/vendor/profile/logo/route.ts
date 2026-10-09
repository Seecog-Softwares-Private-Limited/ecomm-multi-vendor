import { NextRequest } from "next/server";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "node:crypto";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
} from "@/lib/api";
import { assertSellerAuthComplete } from "@/lib/auth";
import { parseFormDataUpload } from "@/lib/uploads/parse-form-file";
import {
  resolveImageMimeWithBuffer,
  safeImageExtension,
} from "@/lib/uploads/image-mime";
import { getPublicUploadsRoot } from "@/lib/uploads/storage";
import {
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_LABEL,
} from "@/lib/uploads/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Align with product image upload + storefront FileUpload accept list. */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = MAX_UPLOAD_SIZE_BYTES;

function getBaseUrl(request: NextRequest): string {
  const host =
    request.headers.get("host") ||
    (process.env.PORT ? `localhost:${process.env.PORT}` : "localhost");
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return `${proto === "https" ? "https" : "http"}://${host}`;
}

/**
 * POST /api/vendor/profile/logo — upload a storefront logo.
 * Auth: seller with completed auth onboarding (any KYC status including draft/rejected).
 * Does not require APPROVED. Product images remain on POST /api/vendor/upload.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  await assertSellerAuthComplete(request);

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return apiBadRequest("Invalid form data");
  }

  const upload = parseFormDataUpload(formData, "file");
  if (!upload) {
    return apiBadRequest("Missing or invalid file");
  }
  if (upload.size === 0) {
    return apiBadRequest("File is empty.");
  }
  if (upload.size > MAX_SIZE_BYTES) {
    return apiBadRequest(`File too large. Maximum size is ${MAX_UPLOAD_SIZE_LABEL}.`);
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await upload.blob.arrayBuffer());
  } catch {
    return apiBadRequest("Could not read uploaded image.");
  }

  const mime = resolveImageMimeWithBuffer(upload.type, upload.name, buffer);
  if (!mime || !ALLOWED_TYPES.includes(mime)) {
    return apiBadRequest("Invalid file type. Use JPEG, PNG, WebP, or GIF.");
  }

  const safeExt = safeImageExtension(upload.name, mime);
  const filename = `${randomUUID()}${safeExt}`;
  const uploadsDir = getPublicUploadsRoot();
  const filePath = path.join(uploadsDir, filename);

  await mkdir(uploadsDir, { recursive: true });
  try {
    await writeFile(filePath, buffer);
  } catch (err) {
    console.error("[vendor/profile/logo] Failed to write file:", err);
    return apiBadRequest("Could not save uploaded image.");
  }

  try {
    const baseUrl = getBaseUrl(request);
    const url = `${baseUrl}/uploads/${filename}`;
    return apiSuccess({ url });
  } catch (err) {
    try {
      await unlink(filePath);
    } catch {
      // Best effort — do not leave the caller blocked if cleanup fails.
    }
    console.error("[vendor/profile/logo] Failed after write:", err);
    throw err;
  }
});
