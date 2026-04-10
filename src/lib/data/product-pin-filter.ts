import { type Prisma as PrismaTypes } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeServicePincode } from "@/lib/data/pincode-bulk";
import { getPlatformRestrictDeliveryToPincodes } from "@/lib/data/platform-service-pincodes";
import { memCacheGetOrSet } from "@/lib/utils/mem-cache";

const PIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function normalizeShopperPin(pincode: string | undefined): string | undefined {
  return normalizeServicePincode((pincode ?? "").trim());
}

/** Cached: does the platform restrict delivery to a PIN list? */
async function getRestrictSetting(): Promise<boolean> {
  return memCacheGetOrSet("platform:restrict_delivery", PIN_CACHE_TTL, () =>
    getPlatformRestrictDeliveryToPincodes()
  );
}

/** Cached: total number of serviceable pincodes configured. */
async function getServiceablePincodeCount(): Promise<number> {
  return memCacheGetOrSet("platform:pincode_count", PIN_CACHE_TTL, () =>
    prisma.platformServiceablePincode.count()
  );
}

/** Cached per-pincode: is this pincode in the serviceable list? */
async function isPincodeServiceable(pin: string): Promise<boolean> {
  return memCacheGetOrSet(`platform:pin:${pin}`, PIN_CACHE_TTL, async () => {
    const hit = await prisma.platformServiceablePincode.findFirst({
      where: { pincode: pin },
      select: { id: true },
    });
    return hit !== null;
  });
}

/**
 * Returns a Prisma `where` fragment to hide products not deliverable to `pincode`.
 * All three underlying DB calls are cached for 5 minutes so repeated requests
 * on the same page-load (or across requests) hit memory instead of the database.
 */
export async function productPinServiceableWhereAsync(
  pincode: string | undefined
): Promise<PrismaTypes.ProductWhereInput> {
  const p = normalizeShopperPin(pincode);
  if (!p) return {};

  try {
    const restrict = await getRestrictSetting();
    if (!restrict) return {};

    const count = await getServiceablePincodeCount();
    if (count === 0) return {};

    const serviceable = await isPincodeServiceable(p);
    if (serviceable) return {};

    return { id: { in: [] } };
  } catch {
    return {};
  }
}
