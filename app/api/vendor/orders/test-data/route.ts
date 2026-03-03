import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiNotFound } from "@/lib/api";
import { requireVendorApproved } from "@/lib/auth";
import { getCreateOrderTestData } from "@/lib/data/vendor-orders";

/**
 * GET /api/vendor/orders/test-data — returns customerUserId, shippingAddressId, productId
 * for use in Create Order (POST /api/vendor/orders). Use in Postman to copy IDs into the Create Order body.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { sellerId } = await requireVendorApproved(request);

  const data = await getCreateOrderTestData(sellerId);
  if (!data) {
    return apiNotFound(
      "No test data: ensure at least one User has an Address (e.g. register/login as customer and add address), and you have at least one ACTIVE product."
    );
  }
  return apiSuccess(data);
});
