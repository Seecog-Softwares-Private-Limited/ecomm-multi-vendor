import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "node:crypto";
import { getVendorDocsUploadDir } from "@/lib/uploads/storage";
import { parseFormDataUpload } from "@/lib/uploads/parse-form-file";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiBadRequest,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { assertVendorCanEditKyc, upsertVendorDocument } from "@/lib/data/vendor-profile";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") || (process.env.PORT ? `localhost:${process.env.PORT}` : "localhost");
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return `${proto === "https" ? "https" : "http"}://${host}`;
}

/**
 * POST /api/vendor/profile/vendor-documents — upload a category-specific document (multipart: documentName, file).
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }
  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) return apiBadRequest("Vendor not found");

  await assertVendorCanEditKyc(sellerId);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiBadRequest("Invalid form data");
  }

  const documentName = formData.get("documentName");
  if (!documentName || typeof documentName !== "string" || !documentName.trim()) {
    return apiBadRequest("documentName is required");
  }

  const upload = parseFormDataUpload(formData, "file");
  if (!upload) {
    return apiBadRequest("Missing or invalid file");
  }
  const ext = path.extname(upload.name).toLowerCase();
  const mime = upload.type.split(";")[0]?.trim().toLowerCase() || "";
  const typeOk =
    ALLOWED_TYPES.includes(mime) ||
    (mime === "" && /^\.(jpe?g|png|webp|gif|pdf)$/i.test(ext));
  if (!typeOk) {
    return apiBadRequest("Invalid file type. Use JPEG, PNG, WebP, GIF, or PDF.");
  }
  if (upload.size > MAX_SIZE_BYTES) {
    return apiBadRequest("File too large. Maximum size is 5MB.");
  }

  const safeExt = /^\.(jpe?g|png|webp|gif|pdf)$/i.test(ext) ? ext : ".pdf";
  const safeName = documentName.trim().replace(/[^a-zA-Z0-9_\-\s]/g, "_").slice(0, 200);
  const filename = `vendor-doc-${safeName}-${randomUUID()}${safeExt}`.replace(/\s+/g, "-");
  const uploadsDir = getVendorDocsUploadDir();
  const filePath = path.join(uploadsDir, filename);

  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await upload.blob.arrayBuffer());
  await writeFile(filePath, buffer);

  const baseUrl = getBaseUrl(request);
  const url = `${baseUrl}/uploads/vendor-docs/${filename}`;

  await upsertVendorDocument(sellerId, documentName.trim(), url);

  return apiSuccess({ url, documentName: documentName.trim() });
});
