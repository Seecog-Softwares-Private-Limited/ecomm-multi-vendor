import { type Prisma as PrismaTypes } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeServicePincode } from "@/lib/data/pincode-bulk";
import { getPlatformRestrictDeliveryToPincodes } from "@/lib/data/platform-service-pincodes";

function normalizeShopperPin(pincode: string | undefined): string | undefined {
  return normalizeServicePincode((pincode ?? "").trim());
}

/**
 * Products to hide for a shopper PIN when the marketplace restricts delivery to a platform-wide PIN list.
 * Per-seller PIN lists are not used for catalog filtering.
 */
export async function productPinServiceableWhereAsync(
  pincode: string | undefined
): Promise<PrismaTypes.ProductWhereInput> {
  const p = normalizeShopperPin(pincode);
  if (!p) return {};

  try {
    const restrict = await getPlatformRestrictDeliveryToPincodes();
    if (!restrict) return {};

    const count = await prisma.platformServiceablePincode.count();
    if (count === 0) return {};

    const hit = await prisma.platformServiceablePincode.findFirst({
      where: { pincode: p },
      select: { id: true },
    });
    if (hit) return {};

    return { id: { in: [] } };
  } catch {
    /* Missing migration or DB error — do not hide the whole catalog. */
    return {};
  }
}
