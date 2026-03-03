import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function parseDbUrl(url: string): { host: string; port: number; user: string; password: string; database: string } {
  try {
    const u = new URL(url.replace(/^mysql:\/\//, "http://"));
    const database = u.pathname?.replace(/^\//, "").split("?")[0] || "markethub";
    return {
      host: u.hostname || "localhost",
      port: parseInt(u.port || "3306", 10),
      user: decodeURIComponent(u.username || "root"),
      password: decodeURIComponent(u.password || ""),
      database: database || "markethub",
    };
  } catch {
    return { host: "localhost", port: 3306, user: "root", password: "", database: "markethub" };
  }
}

const adapter = new PrismaMariaDb(
  process.env.DATABASE_URL ? parseDbUrl(process.env.DATABASE_URL) : { host: "localhost", port: 3306, user: "root", password: "", database: "markethub" }
);

/**
 * Reusable Prisma client singleton for Next.js App Router.
 * - Development: reuses one instance across hot reloads to avoid exhausting connections.
 * - Production: single instance per process.
 */

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type { PrismaClient };
