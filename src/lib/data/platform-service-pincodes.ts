import { prisma } from "@/lib/prisma";
import { normalizeServicePincode } from "@/lib/data/pincode-bulk";

const CONFIG_ID = "default";

export type PlatformServicePincodeRow = {
  id: string;
  pincode: string;
  createdAt: Date;
};

export async function ensurePlatformDeliveryConfig(): Promise<{ restrictDeliveryToPincodes: boolean }> {
  const row = await prisma.platformDeliveryConfig.findUnique({ where: { id: CONFIG_ID } });
  if (row) return row;
  return prisma.platformDeliveryConfig.create({
    data: { id: CONFIG_ID, restrictDeliveryToPincodes: false },
  });
}

export async function listPlatformServicePincodes(): Promise<PlatformServicePincodeRow[]> {
  return prisma.platformServiceablePincode.findMany({
    orderBy: { pincode: "asc" },
    select: { id: true, pincode: true, createdAt: true },
  });
}

export async function getPlatformRestrictDeliveryToPincodes(): Promise<boolean> {
  const row = await prisma.platformDeliveryConfig.findUnique({
    where: { id: CONFIG_ID },
    select: { restrictDeliveryToPincodes: true },
  });
  return row?.restrictDeliveryToPincodes ?? false;
}

export async function setPlatformRestrictDeliveryToPincodes(restrict: boolean): Promise<void> {
  await ensurePlatformDeliveryConfig();
  await prisma.platformDeliveryConfig.update({
    where: { id: CONFIG_ID },
    data: { restrictDeliveryToPincodes: restrict },
  });
}

/**
 * When the platform does not restrict, or the PIN list is empty, every PIN is treated as serviceable.
 * When restricting with a non-empty list, the shopper PIN must appear in the platform list.
 */
export async function isShopperPinServiceableOnPlatform(pincode: string | undefined): Promise<boolean> {
  const p = pincode ? normalizeServicePincode(pincode) : undefined;
  if (!p) return true;

  try {
    const restrict = await getPlatformRestrictDeliveryToPincodes();
    if (!restrict) return true;

    const count = await prisma.platformServiceablePincode.count();
    if (count === 0) return true;

    const hit = await prisma.platformServiceablePincode.findFirst({
      where: { pincode: p },
      select: { id: true },
    });
    return hit != null;
  } catch {
    return true;
  }
}

export async function addPlatformServicePincode(
  pincode: string
): Promise<{ ok: true } | { ok: false; code: "INVALID" | "DUPLICATE" }> {
  const p = normalizeServicePincode(pincode);
  if (!p) return { ok: false, code: "INVALID" };

  try {
    await prisma.platformServiceablePincode.create({
      data: { pincode: p },
    });
    return { ok: true };
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? (e as { code?: string }).code : undefined;
    if (code === "P2002") return { ok: false, code: "DUPLICATE" };
    throw e;
  }
}

export async function removePlatformServicePincode(pincode: string): Promise<{ deleted: number }> {
  const p = normalizeServicePincode(pincode);
  if (!p) return { deleted: 0 };
  const res = await prisma.platformServiceablePincode.deleteMany({
    where: { pincode: p },
  });
  return { deleted: res.count };
}

export async function addPlatformServicePincodesBulk(
  pincodes: string[]
): Promise<{ added: number; skippedExisting: number }> {
  if (pincodes.length === 0) return { added: 0, skippedExisting: 0 };

  const result = await prisma.platformServiceablePincode.createMany({
    data: pincodes.map((pincode) => ({ pincode })),
    skipDuplicates: true,
  });

  const added = result.count;
  const skippedExisting = pincodes.length - added;
  return { added, skippedExisting };
}
