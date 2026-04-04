import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden, apiBadRequest, apiNotFound } from "@/lib/api";
import type { ApiRouteContext } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { deleteVendorDocument } from "@/lib/data/vendor-profile";

/**
 * DELETE /api/vendor/profile/vendor-documents/[id]
 * Soft-deletes a vendor document by its UUID.
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER") return apiForbidden("Vendor access required");
  const sellerId = session.sub;

  const params = context ? await context.params : {};
  const raw = params.id;
  const id = Array.isArray(raw) ? raw[0] : (raw ?? "");
  if (!id) return apiBadRequest("Document ID is required");

  try {
    await deleteVendorDocument(sellerId, id);
    return apiSuccess({ deleted: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    if (msg === "Document not found") return apiNotFound("Document not found");
    throw e;
  }
});
