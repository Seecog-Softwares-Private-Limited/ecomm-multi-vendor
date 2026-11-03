import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "node:crypto";
import { getPublicUploadsRoot } from "@/lib/uploads/storage";
import { parseFormDataUpload } from "@/lib/uploads/parse-form-file";
import { resolveImageMime, safeImageExtension } from "@/lib/uploads/image-mime";
import { withApiHandler, apiSuccess, apiBadRequest } from "@/lib/api";
import { requireAdminPermission } from "@/lib/admin-rbac";
import { MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_LABEL } from "@/lib/uploads/limits";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * POST /api/admin/banners/upload — upload a banner image (admin only). Returns a site-relative URL.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "cms");
  if (ctx instanceof Response) return ctx;

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return apiBadRequest("Invalid form data");
  }

  const upload = parseFormDataUpload(formData, "file");
  if (!upload) return apiBadRequest("Missing or invalid file");

  const mime = resolveImageMime(upload.type, upload.name);
  if (!mime || !ALLOWED_TYPES.includes(mime)) {
    return apiBadRequest("Invalid file type. Use JPEG, PNG, WebP, or GIF.");
  }
  if (upload.size > MAX_UPLOAD_SIZE_BYTES) {
    return apiBadRequest(`File too large. Maximum size is ${MAX_UPLOAD_SIZE_LABEL}.`);
  }

  const filename = `${randomUUID()}${safeImageExtension(upload.name, mime)}`;
  const uploadsDir = getPublicUploadsRoot();
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), Buffer.from(await upload.blob.arrayBuffer()));

  return apiSuccess({ url: `/uploads/${filename}` });
});
