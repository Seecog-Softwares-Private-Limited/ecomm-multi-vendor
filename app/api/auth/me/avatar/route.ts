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
import { prisma } from "@/lib/prisma";
import {
  resolveImageMimeWithBuffer,
  avatarStorageExtension,
} from "@/lib/uploads/image-mime";
import { parseFormDataUpload } from "@/lib/uploads/parse-form-file";
import { getAvatarsUploadDir } from "@/lib/uploads/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") || `localhost:${process.env.PORT ?? "3000"}`;
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return `${proto === "https" ? "https" : "http"}://${host}`;
}

function isStorageError(err: unknown): boolean {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as NodeJS.ErrnoException).code)
      : "";
  return ["EACCES", "EROFS", "ENOSPC", "ENOENT", "EPERM"].includes(code);
}

/**
 * POST /api/auth/me/avatar
 * Multipart body: field "file" (JPEG/PNG/WebP/GIF/HEIC, max 5 MB).
 * Returns { avatarUrl: string }
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Not authenticated");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can upload an avatar here.");

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    console.error("[avatar] formData parse failed:", err);
    return apiBadRequest("Could not read upload. Try a smaller image (under 5 MB).");
  }

  const upload = parseFormDataUpload(formData, "file");
  if (!upload) {
    return apiBadRequest("No file provided");
  }

  if (upload.size > MAX_SIZE_BYTES) {
    return apiBadRequest("File too large. Maximum size is 5 MB.");
  }
  if (upload.size === 0) {
    return apiBadRequest("File is empty.");
  }

  const dir = getAvatarsUploadDir();
  let buffer: Buffer;
  try {
    buffer = Buffer.from(await upload.blob.arrayBuffer());
  } catch (err) {
    console.error("[avatar] arrayBuffer failed:", err);
    return apiBadRequest("Could not read uploaded image.");
  }

  const mime = resolveImageMimeWithBuffer(upload.type, upload.name, buffer);
  if (!mime) {
    return apiBadRequest(
      "Invalid file type. Use JPEG, PNG, WebP, GIF, or HEIC (iPhone photos are supported)."
    );
  }

  const safeExt = avatarStorageExtension(upload.name, mime, buffer);
  const filename = `avatar-${session.sub}-${randomUUID()}${safeExt}`;

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
  } catch (err) {
    console.error("[avatar] Failed to write file:", err);
    if (isStorageError(err)) {
      return apiError(
        "Server cannot save uploaded files. Set PUBLIC_UPLOAD_ROOT to a writable folder and restart.",
        Status.INTERNAL_SERVER_ERROR,
        "UPLOAD_STORAGE"
      );
    }
    throw err;
  }

  const avatarUrl = `${getBaseUrl(request)}/uploads/avatars/${filename}`;

  await prisma.user.update({
    where: { id: session.sub, deletedAt: null },
    data: { avatarUrl },
  });

  return apiSuccess({ avatarUrl });
});
