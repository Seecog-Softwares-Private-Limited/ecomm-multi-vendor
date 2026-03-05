import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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
  const host = request.headers.get("host") || "localhost:3004";
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return `${proto === "https" ? "https" : "http"}://${host}`;
}

/**
 * POST /api/vendor/upload — upload a product image. Requires approved vendor status.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  await requireVendorApproved(request);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiBadRequest("Invalid form data");
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return apiBadRequest("Missing or invalid file");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return apiBadRequest(
      "Invalid file type. Use JPEG, PNG, WebP, or GIF."
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return apiBadRequest("File too large. Maximum size is 5MB.");
  }

  const ext = path.extname(file.name) || ".jpg";
  const safeExt = /^\.(jpe?g|png|webp|gif)$/i.test(ext) ? ext : ".jpg";
  const filename = `${crypto.randomUUID()}${safeExt}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadsDir, filename);

  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const baseUrl = getBaseUrl(request);
  const url = `${baseUrl}/uploads/${filename}`;

  return apiSuccess({ url });
});
