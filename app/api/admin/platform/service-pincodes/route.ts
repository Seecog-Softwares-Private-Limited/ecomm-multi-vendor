import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiValidationError,
  apiConflict,
  apiError,
  Status,
} from "@/lib/api";
import { requireAdminPermission } from "@/lib/admin-rbac";
import {
  listPlatformServicePincodes,
  addPlatformServicePincode,
  addPlatformServicePincodesBulk,
  getPlatformRestrictDeliveryToPincodes,
  setPlatformRestrictDeliveryToPincodes,
  removePlatformServicePincode,
} from "@/lib/data/platform-service-pincodes";
import { parseBulkPinInput, normalizeServicePincode } from "@/lib/data/pincode-bulk";
import {
  parseWithDetails,
  vendorAddServicePincodesBodySchema,
  vendorDeliveryScopePatchSchema,
} from "@/lib/validation";

/**
 * GET /api/admin/platform/service-pincodes — marketplace-wide PIN list + restrict flag (admin, sellers permission).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "sellers");
  if (ctx instanceof Response) return ctx;

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
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && (e.code === "P2021" || e.code === "P2010")) {
      return apiError(
        "Platform delivery tables are missing. Run: npx prisma migrate deploy && npx prisma generate",
        Status.SERVICE_UNAVAILABLE,
        "MIGRATION_REQUIRED"
      );
    }
    throw e;
  }
});

/**
 * POST — add one PIN or bulk (platform-wide).
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "sellers");
  if (ctx instanceof Response) return ctx;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const parsed = parseWithDetails(vendorAddServicePincodesBodySchema, body);
  if (!parsed.success) {
    return apiValidationError("Validation failed", parsed.details);
  }

  if ("pincode" in parsed.data) {
    const result = await addPlatformServicePincode(parsed.data.pincode);
    if (!result.ok) {
      if (result.code === "INVALID") return apiBadRequest("Enter a valid 6-digit PIN");
      return apiConflict("This PIN is already on the marketplace list");
    }
  } else {
    const { pincodes, invalidSamples } = parseBulkPinInput(parsed.data.bulkText);
    if (pincodes.length > 2000) {
      return apiBadRequest("Too many PINs in one request (maximum 2000). Split into multiple batches.");
    }
    if (pincodes.length === 0) {
      return apiBadRequest(
        invalidSamples.length > 0
          ? "No valid 6-digit PINs found. Use digits only (e.g. 400001)."
          : "No PINs to add. Paste one or more 6-digit PINs, separated by comma or new line."
      );
    }
    const { added, skippedExisting } = await addPlatformServicePincodesBulk(pincodes);
    const rows = await listPlatformServicePincodes();
    return apiSuccess({
      pincodes: rows.map((r) => ({
        id: r.id,
        pincode: r.pincode,
        createdAt: r.createdAt.toISOString(),
      })),
      bulkSummary: { added, skippedExisting, invalidSamples },
    });
  }

  const rows = await listPlatformServicePincodes();
  return apiSuccess({
    pincodes: rows.map((r) => ({ id: r.id, pincode: r.pincode, createdAt: r.createdAt.toISOString() })),
  });
});

/**
 * PATCH — pan-India vs PIN-list for the whole site.
 */
export const PATCH = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "sellers");
  if (ctx instanceof Response) return ctx;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const parsed = parseWithDetails(vendorDeliveryScopePatchSchema, body);
  if (!parsed.success) {
    return apiValidationError("Validation failed", parsed.details);
  }

  await setPlatformRestrictDeliveryToPincodes(parsed.data.restrictDeliveryToPincodes);
  const restrictDeliveryToPincodes = await getPlatformRestrictDeliveryToPincodes();
  return apiSuccess({ restrictDeliveryToPincodes });
});

/**
 * DELETE ?pincode= — remove one PIN from the marketplace list.
 */
export const DELETE = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "sellers");
  if (ctx instanceof Response) return ctx;

  const raw = new URL(request.url).searchParams.get("pincode") ?? "";
  const p = normalizeServicePincode(raw);
  if (!p) return apiBadRequest("pincode query must be a 6-digit PIN");

  const { deleted } = await removePlatformServicePincode(p);
  if (deleted === 0) return apiBadRequest("PIN not found on the marketplace list");

  const rows = await listPlatformServicePincodes();
  return apiSuccess({
    pincodes: rows.map((r) => ({ id: r.id, pincode: r.pincode, createdAt: r.createdAt.toISOString() })),
  });
});
