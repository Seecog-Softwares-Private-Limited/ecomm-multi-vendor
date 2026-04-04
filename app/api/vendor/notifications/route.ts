import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/vendor/notifications
 * Query params:
 *   limit    – max items returned (default 50)
 *   unread   – "true" → only unread
 * Returns { notifications, unreadCount }
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER") return apiForbidden("Vendor access required");
  const sellerId = session.sub;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50")));
  const unreadOnly = searchParams.get("unread") === "true";

  const where = {
    sellerId,
    deletedAt: null,
    ...(unreadOnly ? { read: false } : {}),
  };

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        read: true,
        readAt: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({ where: { sellerId, read: false, deletedAt: null } }),
  ]);

  return apiSuccess({
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  });
});

/**
 * PATCH /api/vendor/notifications
 * Mark ALL unread notifications as read for this seller.
 */
export const PATCH = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER") return apiForbidden("Vendor access required");
  const sellerId = session.sub;

  const now = new Date();
  const result = await prisma.notification.updateMany({
    where: { sellerId, read: false, deletedAt: null },
    data: { read: true, readAt: now },
  });

  return apiSuccess({ updated: result.count });
});
