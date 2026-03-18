import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { NotificationType } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

const PAGE_SIZE = 10;
const TYPE_MAP: Record<string, NotificationType> = {
  system: "SYSTEM",
  order: "ORDER",
  seller: "SELLER",
  payment: "PAYMENT",
  return: "RETURN",
};

/**
 * GET /api/admin/notifications — list notifications for current admin.
 * Query: type (system|order|seller|payment|return), read (true|false), page, pageSize.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "settings");
  if (ctx instanceof Response) return ctx;

  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("type")?.toLowerCase() ?? "";
  const readParam = searchParams.get("read")?.toLowerCase();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? String(PAGE_SIZE), 10) || PAGE_SIZE));

  const where: Prisma.NotificationWhereInput = {
    adminId: ctx.admin.id,
    deletedAt: null,
  };

  if (typeParam && TYPE_MAP[typeParam]) {
    where.type = TYPE_MAP[typeParam];
  }
  if (readParam === "true") where.read = true;
  if (readParam === "false") where.read = false;

  const [list, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, type: true, title: true, message: true, read: true, createdAt: true },
    }),
    prisma.notification.count({ where }),
  ]);

  const notifications = list.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    date: n.createdAt.toISOString().slice(0, 10),
    read: n.read,
  }));

  const totalPages = Math.ceil(total / pageSize) || 1;

  return apiSuccess(
    { notifications },
    Status.OK,
    { total, page, pageSize, totalPages }
  );
});
