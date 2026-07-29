import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { invalidateCartCache } from "./cache";

type Tx = Prisma.TransactionClient;

export async function getCartVersion(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: { cartVersion: true },
  });
  return user?.cartVersion ?? 0;
}

/** Increment cart version after any cart mutation. Call inside or outside a transaction. */
export async function incrementCartVersion(userId: string, tx?: Tx): Promise<number> {
  const client = tx ?? prisma;
  const updated = await client.user.update({
    where: { id: userId },
    data: { cartVersion: { increment: 1 } },
    select: { cartVersion: true },
  });
  if (!tx) {
    invalidateCartCache(userId);
  }
  return updated.cartVersion;
}
