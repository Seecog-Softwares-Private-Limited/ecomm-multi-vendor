import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Reads `users.avatar_url` when the column exists.
 * Older databases that have not applied migration `20260430160000_user_oauth_fields`
 * will throw from Prisma if `avatarUrl` is included in `select`; this uses a raw query
 * so a missing column is caught and returns null instead of breaking `/api/auth/me`.
 */
export async function getUserAvatarUrlSafe(userId: string): Promise<string | null> {
  try {
    const rows = await prisma.$queryRaw<{ avatar_url: string | null }[]>(
      Prisma.sql`SELECT avatar_url FROM users WHERE id = ${userId} LIMIT 1`
    );
    return rows[0]?.avatar_url ?? null;
  } catch {
    return null;
  }
}

export type SetUserAvatarResult =
  | { ok: true }
  | { ok: false; reason: "missing_column" | "user_not_found" };

/**
 * Persists avatar URL via raw SQL so it matches {@link getUserAvatarUrlSafe} behavior
 * when `avatar_url` exists, and returns a clear result when the column is missing.
 */
export async function setUserAvatarUrlSafe(
  userId: string,
  avatarUrl: string
): Promise<SetUserAvatarResult> {
  try {
    const updated = await prisma.$executeRaw(
      Prisma.sql`UPDATE users SET avatar_url = ${avatarUrl} WHERE id = ${userId} AND deleted_at IS NULL`
    );
    if (updated === 0) return { ok: false, reason: "user_not_found" };
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/Unknown column.*avatar_url|avatar_url.*doesn't exist/i.test(msg)) {
      return { ok: false, reason: "missing_column" };
    }
    throw err;
  }
}
