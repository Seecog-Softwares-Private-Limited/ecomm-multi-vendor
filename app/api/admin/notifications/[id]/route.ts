import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiNotFound,
} from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/admin/notifications/[id] — soft-delete notification (admin only).
 */
export const DELETE = withApiHandler(async (request: NextRequest, context) => {
  const session = await requireSession(request);
  if (session.role !== "ADMIN") {
    return apiForbidden("Admin access required");
  }

  const params = context?.params ? await context.params : {};
  const id = typeof params.id === "string" ? params.id : undefined;
  if (!id) {
    return apiNotFound("Notification not found");
  }
  const notification = await prisma.notification.findFirst({
    where: { id, adminId: session.sub, deletedAt: null },
    select: { id: true },
  });

  if (!notification) {
    return apiNotFound("Notification not found");
  }

  await prisma.notification.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return apiSuccess({ message: "Notification deleted" });
});
