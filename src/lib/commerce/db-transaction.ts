import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEADLOCK_ERROR_CODES = new Set(["P2034", "P2010", "1213", "40001"]);

function isDeadlockError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (DEADLOCK_ERROR_CODES.has(err.code)) return true;
    const metaCode = (err.meta as { code?: string | number } | undefined)?.code;
    if (metaCode !== undefined && DEADLOCK_ERROR_CODES.has(String(metaCode))) return true;
  }
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("Deadlock") || msg.includes("1213") || msg.includes("40001");
}

export type CommerceTransactionOptions = {
  /** Max attempts including the first (default 4). */
  deadlockRetries?: number;
  /** Backoff base ms between deadlock retries (default 25). */
  deadlockBackoffMs?: number;
};

/**
 * Run a commerce-critical transaction with READ COMMITTED isolation and deadlock retry.
 * READ COMMITTED ensures reservation sums see committed rows from other sessions.
 */
export async function runCommerceTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options: CommerceTransactionOptions = {}
): Promise<T> {
  const maxAttempts = options.deadlockRetries ?? 6;
  const backoffMs = options.deadlockBackoffMs ?? 40;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        maxWait: 10_000,
        timeout: 30_000,
      });
    } catch (err) {
      lastError = err;
      if (!isDeadlockError(err) || attempt >= maxAttempts) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, backoffMs * attempt));
    }
  }
  throw lastError;
}
