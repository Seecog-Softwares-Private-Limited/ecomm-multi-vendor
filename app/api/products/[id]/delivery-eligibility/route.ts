import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiNotFound, apiValidationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { normalizeServicePincode } from "@/lib/data/pincode-bulk";
import { isShopperPinServiceableOnPlatform } from "@/lib/data/platform-service-pincodes";
import { productIdParamSchema, parseWithDetails } from "@/lib/validation";

type RouteContext = { params?: Promise<Record<string, string | string[]>> };

/**
 * GET /api/products/:id/delivery-eligibility?pincode=400001
 * When pincode is missing or invalid, eligible is true (same as catalog: no PIN filter).
 */
export const GET = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const params = context?.params ? await context.params : {};
  const raw = { id: typeof params.id === "string" ? params.id : params.id?.[0] };

  const parsedId = parseWithDetails(productIdParamSchema, raw);
  if (!parsedId.success) {
    return apiValidationError("Validation failed", parsedId.details);
  }

  const pinRaw = new URL(request.url).searchParams.get("pincode") ?? "";
  const pincode = normalizeServicePincode(pinRaw);

  const product = await prisma.product.findFirst({
    where: { id: parsedId.data.id, deletedAt: null, status: "ACTIVE" },
    select: { id: true },
  });
  if (!product) return apiNotFound("Product not found");

  const eligible = await isShopperPinServiceableOnPlatform(pincode);
  return apiSuccess({
    eligible,
    pincode: pincode ?? null,
    reason: eligible ? null : "PIN_NOT_SERVICEABLE",
  });
});
