import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getPublicUploadsRoot } from "@/lib/uploads/storage";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function isSafeSegment(seg: string): boolean {
  if (!seg || seg === "." || seg === "..") return false;
  if (seg.includes("..") || seg.includes("/") || seg.includes("\\")) return false;
  return true;
}

/**
 * GET /api/uploads/kyc/... — serve files from public/uploads.
 * Also reached via rewrite: /uploads/* → /api/uploads/* (see next.config.ts).
 */
export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const UPLOADS_ROOT = getPublicUploadsRoot();
  const { path: segments } = await ctx.params;
  if (!segments?.length) {
    return new NextResponse("Not Found", { status: 404 });
  }

  for (const s of segments) {
    if (!isSafeSegment(s)) {
      return new NextResponse("Bad Request", { status: 400 });
    }
  }

  const absolute = path.resolve(UPLOADS_ROOT, ...segments);
  const rootWithSep = UPLOADS_ROOT.endsWith(path.sep)
    ? UPLOADS_ROOT
    : UPLOADS_ROOT + path.sep;

  if (absolute !== UPLOADS_ROOT && !absolute.startsWith(rootWithSep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const data = await readFile(absolute);
    const ext = path.extname(absolute).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
