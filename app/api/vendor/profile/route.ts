import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiNotFound,
  apiBadRequest,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import {
  getVendorProfile,
  updateVendorProfile,
  type UpdateVendorProfilePayload,
} from "@/lib/data/vendor-profile";

/**
 * GET /api/vendor/profile — get full profile (business, owner, bank, documents) for the logged-in vendor.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }
  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) return apiNotFound("Vendor not found");

  const profile = await getVendorProfile(sellerId);
  if (!profile) return apiNotFound("Profile not found");
  return apiSuccess(profile);
});

/**
 * PUT /api/vendor/profile — update profile (draft) or submit for approval.
 * Body: { business?: {...}, owner?: {...}, bank?: {...}, status?: "draft" | "submitted" }.
 */
export const PUT = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER" && session.role !== "ADMIN") {
    return apiForbidden("Vendor access required");
  }
  const sellerId = session.role === "SELLER" ? session.sub : undefined;
  if (!sellerId) return apiNotFound("Vendor not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const payload = body as UpdateVendorProfilePayload;
  await updateVendorProfile(sellerId, payload);
  const profile = await getVendorProfile(sellerId);
  return apiSuccess(profile ?? {});
});
