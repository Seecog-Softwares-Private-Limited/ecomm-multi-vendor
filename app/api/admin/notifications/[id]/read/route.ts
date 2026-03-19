import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiNotFound,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

/**
 * PATCH /api/admin/notifications/[id]/read — mark notification as read (admin only).
 */
export const PATCH = withApiHandler(async (request: NextRequest, context) => {
  const ctx = await requireAdminPermission(request, "notifications");
  if (ctx instanceof Response) return ctx;

  const params = context?.params ? await context.params : {};
  const id = typeof params.id === "string" ? params.id : undefined;
  if (!id) {
    return apiNotFound("Notification not found");
  }
  const notification = await prisma.notification.findFirst({
    where: { id, adminId: ctx.admin.id, deletedAt: null },
    select: { id: true },
  });

  if (!notification) {
    return apiNotFound("Notification not found");
  }

  await prisma.notification.update({
    where: { id },
    data: { read: true, readAt: new Date() },
  });

  return apiSuccess({ message: "Marked as read" });
});
