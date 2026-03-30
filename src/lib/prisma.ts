import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  /** Invalidated in dev when schema or generated client changes (avoids stale Prisma after `prisma generate`). */
  __prismaDevFp?: string;
};

/**
 * In development, `schema.prisma` or `prisma generate` output can change while `globalThis.prisma`
 * still holds an old engine/client → updates fail (e.g. unknown field `description`). Bump
 * fingerprint when either file changes so we recreate the client.
 */
function getDevPrismaFingerprint(): string {
  try {
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    const clientIndex = path.join(process.cwd(), "node_modules", ".prisma", "client", "index.js");
    const s = fs.statSync(schemaPath);
    let clientMtime = 0;
    try {
      clientMtime = fs.statSync(clientIndex).mtimeMs;
    } catch {
      /* client not generated yet */
    }
    return `${s.mtimeMs}:${clientMtime}`;
  } catch {
    return `unknown:${Date.now()}`;
  }
}

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
    careerOpening?: { create?: unknown };
  };
  return (
    typeof c.sellerServiceablePincode?.findMany === "function" &&
    typeof c.platformServiceablePincode?.findMany === "function" &&
    typeof c.platformDeliveryConfig?.findUnique === "function" &&
    typeof c.careerOpening?.create === "function"
  );
}

function getPrismaSingleton(): PrismaClient {
  const devFp = process.env.NODE_ENV !== "production" ? getDevPrismaFingerprint() : null;
  const existing = globalForPrisma.prisma;

  if (existing && process.env.NODE_ENV !== "production") {
    const staleConstructor = existing.constructor !== PrismaClient;
    const staleFingerprint = devFp != null && globalForPrisma.__prismaDevFp !== devFp;
    if (staleConstructor || !delegateLooksValid(existing) || staleFingerprint) {
      void existing.$disconnect().catch(() => {});
      delete globalForPrisma.prisma;
      delete globalForPrisma.__prismaDevFp;
    }
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  if (devFp != null) {
    globalForPrisma.__prismaDevFp = devFp;
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
