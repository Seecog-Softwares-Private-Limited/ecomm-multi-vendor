import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "node:crypto";
import { getPublicUploadsRoot } from "@/lib/uploads/storage";
import { parseFormDataUpload } from "@/lib/uploads/parse-form-file";
import { resolveImageMime, safeImageExtension } from "@/lib/uploads/image-mime";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiBadRequest,
} from "@/lib/api";
import { requireVendorApproved } from "@/lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") || (process.env.PORT ? `localhost:${process.env.PORT}` : "localhost");
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return `${proto === "https" ? "https" : "http"}://${host}`;
}

/**
 * POST /api/vendor/upload — upload a product image. Requires approved vendor status.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  await requireVendorApproved(request);

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

  const mime = resolveImageMime(upload.type, upload.name);
  if (!mime || !ALLOWED_TYPES.includes(mime)) {
    return apiBadRequest(
      "Invalid file type. Use JPEG, PNG, WebP, or GIF."
    );
  }
  if (upload.size > MAX_SIZE_BYTES) {
    return apiBadRequest("File too large. Maximum size is 5MB.");
  }

  const safeExt = safeImageExtension(upload.name, mime);
  const filename = `${randomUUID()}${safeExt}`;
  const uploadsDir = getPublicUploadsRoot();
  const filePath = path.join(uploadsDir, filename);

  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await upload.blob.arrayBuffer());
  await writeFile(filePath, buffer);

  const baseUrl = getBaseUrl(request);
  const url = `${baseUrl}/uploads/${filename}`;

  return apiSuccess({ url });
});
