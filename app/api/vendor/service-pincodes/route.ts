import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { withApiHandler, apiSuccess, apiForbidden, apiError, Status } from "@/lib/api";
import { requireVendorApproved } from "@/lib/auth";
import {
  listPlatformServicePincodes,
  getPlatformRestrictDeliveryToPincodes,
} from "@/lib/data/platform-service-pincodes";

const VENDOR_PIN_FORBIDDEN =
  "Delivery areas are managed by the platform in the admin panel. Contact support if you need changes.";

/**
 * GET /api/vendor/service-pincodes — read-only snapshot of marketplace-wide PIN rules (same list for all sellers).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  await requireVendorApproved(request);
  try {
    const [rows, restrictDeliveryToPincodes] = await Promise.all([
      listPlatformServicePincodes(),
      getPlatformRestrictDeliveryToPincodes(),
    ]);
    return apiSuccess({
      pincodes: rows.map((r) => ({
        id: r.id,
        pincode: r.pincode,
        createdAt: r.createdAt.toISOString(),
      })),
      restrictDeliveryToPincodes,
      scope: "marketplace" as const,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && (e.code === "P2021" || e.code === "P2010")) {
      return apiError(
        "Platform delivery is not configured yet (database migration required).",
        Status.SERVICE_UNAVAILABLE,
        "MIGRATION_REQUIRED"
      );
    }
    throw e;
  }
});

export const POST = withApiHandler(async (request: NextRequest) => {
  await requireVendorApproved(request);
  return apiForbidden(VENDOR_PIN_FORBIDDEN);
});

export const PATCH = withApiHandler(async (request: NextRequest) => {
  await requireVendorApproved(request);
  return apiForbidden(VENDOR_PIN_FORBIDDEN);
});

export const DELETE = withApiHandler(async (request: NextRequest) => {
  await requireVendorApproved(request);
  return apiForbidden(VENDOR_PIN_FORBIDDEN);
});
