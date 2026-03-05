import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiBadRequest,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { upsertKycDocument } from "@/lib/data/vendor-profile";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const KYC_TYPES = ["PAN", "GST_CERTIFICATE", "ADDRESS_PROOF"] as const;

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") || "localhost:3004";
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return `${proto === "https" ? "https" : "http"}://${host}`;
}

/**
 * POST /api/vendor/profile/documents — upload a KYC document (multipart: documentType, file).
 * documentType: PAN | GST_CERTIFICATE | ADDRESS_PROOF.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }
  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) return apiBadRequest("Vendor not found");

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiBadRequest("Invalid form data");
  }

  const documentType = formData.get("documentType");
  if (
    !documentType ||
    typeof documentType !== "string" ||
    !KYC_TYPES.includes(documentType as (typeof KYC_TYPES)[number])
  ) {
    return apiBadRequest("documentType must be PAN, GST_CERTIFICATE, or ADDRESS_PROOF");
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return apiBadRequest("Missing or invalid file");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return apiBadRequest("Invalid file type. Use JPEG, PNG, WebP, GIF, or PDF.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    return apiBadRequest("File too large. Maximum size is 5MB.");
  }

  const ext = path.extname(file.name) || ".pdf";
  const safeExt = /^\.(jpe?g|png|webp|gif|pdf)$/i.test(ext) ? ext : ".pdf";
  const filename = `kyc-${documentType}-${crypto.randomUUID()}${safeExt}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "kyc");
  const filePath = path.join(uploadsDir, filename);

  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const baseUrl = getBaseUrl(request);
  const url = `${baseUrl}/uploads/kyc/${filename}`;

  await upsertKycDocument(
    sellerId,
    documentType as "PAN" | "GST_CERTIFICATE" | "ADDRESS_PROOF",
    url
  );

  return apiSuccess({ url, documentType });
});
