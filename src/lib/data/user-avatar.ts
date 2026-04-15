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
