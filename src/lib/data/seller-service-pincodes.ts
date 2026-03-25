import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeServicePincode, parseBulkPinInput } from "@/lib/data/pincode-bulk";
import { isShopperPinServiceableOnPlatform } from "@/lib/data/platform-service-pincodes";

export { normalizeServicePincode, parseBulkPinInput } from "@/lib/data/pincode-bulk";

/** Thrown when `restrict_delivery_to_pincodes` column is missing (migrate not applied). */
export class SellerDeliverySettingsColumnMissingError extends Error {
  override readonly name = "SellerDeliverySettingsColumnMissingError";
  constructor() {
    super(
      "Database is missing column restrict_delivery_to_pincodes. Stop the dev server, run: npx prisma migrate deploy && npx prisma generate"
    );
  }
}

function isMissingRestrictDeliveryColumn(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e);
  return m.includes("Unknown column") && m.includes("restrict_delivery");
}

export type SellerServicePincodeRow = {
  id: string;
  pincode: string;
  createdAt: Date;
};

export async function listSellerServicePincodes(sellerId: string): Promise<SellerServicePincodeRow[]> {
  return prisma.sellerServiceablePincode.findMany({
    where: { sellerId },
    orderBy: { pincode: "asc" },
    select: { id: true, pincode: true, createdAt: true },
  });
}

/**
 * Catalog and PDP use platform-wide PIN rules; sellerId is ignored (kept for API compatibility).
 */
export async function isSellerServiceableForPincode(
  _sellerId: string,
  pincode: string | undefined
): Promise<boolean> {
  return isShopperPinServiceableOnPlatform(pincode);
}

export async function getSellerRestrictDeliveryToPincodes(sellerId: string): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<Array<{ v: number | bigint }>>(
      Prisma.sql`SELECT restrict_delivery_to_pincodes AS v FROM sellers WHERE id = ${sellerId} AND deleted_at IS NULL LIMIT 1`
    );
    const row = rows[0];
    if (row == null) return false;
    return Number(row.v) === 1;
  } catch (e) {
    if (isMissingRestrictDeliveryColumn(e)) return false;
    throw e;
  }
}

export async function setSellerRestrictDeliveryToPincodes(
  sellerId: string,
  restrict: boolean
): Promise<void> {
  try {
    const bit = restrict ? 1 : 0;
    await prisma.$executeRaw(
      Prisma.sql`UPDATE sellers SET restrict_delivery_to_pincodes = ${bit}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ${sellerId} AND deleted_at IS NULL`
    );
  } catch (e) {
    if (isMissingRestrictDeliveryColumn(e)) {
      throw new SellerDeliverySettingsColumnMissingError();
    }
    throw e;
  }
}

export async function addSellerServicePincode(
  sellerId: string,
  pincode: string
): Promise<{ ok: true } | { ok: false; code: "INVALID" | "DUPLICATE" }> {
  const p = normalizeServicePincode(pincode);
  if (!p) return { ok: false, code: "INVALID" };

  try {
    await prisma.sellerServiceablePincode.create({
      data: { sellerId, pincode: p },
    });
    return { ok: true };
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? (e as { code?: string }).code : undefined;
    if (code === "P2002") return { ok: false, code: "DUPLICATE" };
    throw e;
  }
}

export async function removeSellerServicePincode(
  sellerId: string,
  pincode: string
): Promise<{ deleted: number }> {
  const p = normalizeServicePincode(pincode);
  if (!p) return { deleted: 0 };
  const res = await prisma.sellerServiceablePincode.deleteMany({
    where: { sellerId, pincode: p },
  });
  return { deleted: res.count };
}

export async function addSellerServicePincodesBulk(
  sellerId: string,
  pincodes: string[]
): Promise<{ added: number; skippedExisting: number }> {
  if (pincodes.length === 0) return { added: 0, skippedExisting: 0 };

  const result = await prisma.sellerServiceablePincode.createMany({
    data: pincodes.map((pincode) => ({ sellerId, pincode })),
    skipDuplicates: true,
  });

  const added = result.count;
  const skippedExisting = pincodes.length - added;
  return { added, skippedExisting };
}
