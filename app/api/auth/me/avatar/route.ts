import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "node:crypto";
import {
  withApiHandler,
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
  apiError,
  Status,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { setUserAvatarUrlSafe } from "@/lib/data/user-avatar";
import { getAvatarsUploadDir } from "@/lib/uploads/storage";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") || `localhost:${process.env.PORT ?? "3000"}`;
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return `${proto === "https" ? "https" : "http"}://${host}`;
}

function resolveImageMime(file: File): string | null {
  if (file.type && ALLOWED_TYPES.includes(file.type)) return file.type;
  const ext = path.extname(file.name).toLowerCase();
  return EXT_TO_MIME[ext] ?? null;
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
  if (!resolveImageMime(file)) {
    return apiBadRequest("Invalid file type. Use JPEG, PNG, WebP, or GIF.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    return apiBadRequest("File too large. Maximum size is 5 MB.");
  }

  const ext = path.extname(file.name) || ".jpg";
  const safeExt = /^\.(jpe?g|png|webp|gif)$/i.test(ext) ? ext : ".jpg";
  const filename = `avatar-${session.sub}-${randomUUID()}${safeExt}`;

  const dir = getAvatarsUploadDir();
  try {
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);
  } catch (err) {
    console.error("[avatar] Failed to write file:", err);
    const code = typeof err === "object" && err !== null && "code" in err ? String((err as NodeJS.ErrnoException).code) : "";
    if (code === "EACCES" || code === "EROFS" || code === "ENOSPC") {
      return apiError(
        "Server cannot save uploaded files. Set PUBLIC_UPLOAD_ROOT to a writable directory and restart the app.",
        Status.INTERNAL_SERVER_ERROR,
        "UPLOAD_STORAGE"
      );
    }
    throw err;
  }

  const avatarUrl = `${getBaseUrl(request)}/uploads/avatars/${filename}`;

  const saved = await setUserAvatarUrlSafe(session.sub, avatarUrl);
  if (!saved.ok) {
    if (saved.reason === "missing_column") {
      return apiError(
        "Profile photos are not enabled on this database yet. Run: npx prisma migrate deploy",
        Status.INTERNAL_SERVER_ERROR,
        "DATABASE_SCHEMA"
      );
    }
    return apiBadRequest("User not found");
  }

  return apiSuccess({ avatarUrl });
});
