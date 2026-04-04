import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  withApiHandler,
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvatarsUploadDir } from "@/lib/uploads/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") || `localhost:${process.env.PORT ?? "3000"}`;
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return `${proto === "https" ? "https" : "http"}://${host}`;
}

/**
 * POST /api/auth/me/avatar
 * Multipart body: field "file" (JPEG/PNG/WebP/GIF, max 5 MB).
 * Returns { avatarUrl: string }
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Not authenticated");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can upload an avatar here.");

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiBadRequest("Invalid form data");
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return apiBadRequest("No file provided");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return apiBadRequest("Invalid file type. Use JPEG, PNG, WebP, or GIF.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    return apiBadRequest("File too large. Maximum size is 5 MB.");
  }

  const ext = path.extname(file.name) || ".jpg";
  const safeExt = /^\.(jpe?g|png|webp|gif)$/i.test(ext) ? ext : ".jpg";
  const filename = `avatar-${session.sub}-${crypto.randomUUID()}${safeExt}`;

  const dir = getAvatarsUploadDir();
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  const avatarUrl = `${getBaseUrl(request)}/uploads/avatars/${filename}`;

  await prisma.user.update({
    where: { id: session.sub },
    data: { avatarUrl },
  });

  return apiSuccess({ avatarUrl });
});
