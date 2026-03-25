import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * After `prisma generate`, Next.js dev can keep an old PrismaClient on globalThis — delegates
 * like `sellerServiceablePincode` are missing → "Cannot read properties of undefined (reading 'findMany'|'create')".
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

function delegateLooksValid(client: PrismaClient): boolean {
  const c = client as unknown as {
    sellerServiceablePincode?: { findMany?: unknown };
    platformServiceablePincode?: { findMany?: unknown };
    platformDeliveryConfig?: { findUnique?: unknown };
  };
  return (
    typeof c.sellerServiceablePincode?.findMany === "function" &&
    typeof c.platformServiceablePincode?.findMany === "function" &&
    typeof c.platformDeliveryConfig?.findUnique === "function"
  );
}

function getPrismaSingleton(): PrismaClient {
  const existing = globalForPrisma.prisma;

  if (existing && process.env.NODE_ENV !== "production") {
    const staleConstructor = existing.constructor !== PrismaClient;
    if (staleConstructor || !delegateLooksValid(existing)) {
      void existing.$disconnect().catch(() => {});
      delete globalForPrisma.prisma;
    }
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

/**
 * Proxy so consumers never hold a stale instance: each `prisma.model.*` access resolves the
 * current singleton (and dev can recreate after `prisma generate` / HMR).
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getPrismaSingleton();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export type { PrismaClient };
