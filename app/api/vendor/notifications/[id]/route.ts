import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden, apiNotFound, type ApiRouteContext } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/vendor/notifications/:id
 * Mark a single notification as read (must belong to the logged-in seller).
 */
export const PATCH = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER") return apiForbidden("Vendor access required");
  const sellerId = session.sub;

  const params = context ? await context.params : {};
  const raw = params.id;
  const id = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
  if (!id) return apiNotFound("Notification not found");

  const notification = await prisma.notification.findFirst({
    where: { id, sellerId, deletedAt: null },
    select: { id: true, read: true },
  });
  if (!notification) return apiNotFound("Notification not found");
  if (notification.read) return apiSuccess({ id, alreadyRead: true });

  await prisma.notification.update({
    where: { id },
    data: { read: true, readAt: new Date() },
  });

  return apiSuccess({ id, read: true });
});
