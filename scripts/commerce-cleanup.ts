#!/usr/bin/env tsx
/**
 * Scheduled cleanup: expire checkout sessions and release stale stock reservations.
 * Run via cron, e.g. every 15 minutes:
 *   tsx scripts/commerce-cleanup.ts
 */
import { runCommerceCleanup } from "../src/lib/commerce/cleanup";

async function main() {
  const result = await runCommerceCleanup();
  console.log(
    JSON.stringify({
      ok: true,
      expiredSessions: result.sessions,
      releasedStockReservations: result.stock,
      ts: new Date().toISOString(),
    })
  );
}

main().catch((err) => {
  console.error("[commerce-cleanup] failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
