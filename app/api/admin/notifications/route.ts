import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { NotificationType } from "@prisma/client";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-rbac";

const PAGE_SIZE = 10;
const BATCH_SIZE = 500;

const TYPE_MAP: Record<string, NotificationType> = {
  system: "SYSTEM",
  order: "ORDER",
  seller: "SELLER",
  payment: "PAYMENT",
  return: "RETURN",
};

const TARGET_SET = new Set([
  "all_users",
  "all_customers",
  "all_sellers",
  "all_admins",
]);

/**
 * GET /api/admin/notifications — list notifications for current admin.
 * Query: type (system|order|seller|payment|return), read (true|false), page, pageSize.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "notifications");
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

type RecipientField = "userId" | "sellerId" | "adminId";

/**
 * POST /api/admin/notifications — broadcast a notification to a target audience.
 * Body: { type, title, message, target } — target is all_users | all_customers | all_sellers | all_admins.
 * Creates one notification row per recipient (userId, sellerId, or adminId).
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireAdminPermission(request, "notifications");
  if (ctx instanceof Response) return ctx;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (!body || typeof body !== "object") {
    return apiBadRequest("Invalid body");
  }

  const raw = body as Record<string, unknown>;
  const typeStr =
    typeof raw.type === "string" ? raw.type.toLowerCase().trim() : "";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const message = typeof raw.message === "string" ? raw.message.trim() : "";
  const target =
    typeof raw.target === "string" ? raw.target.toLowerCase().trim() : "";

  if (!title) return apiBadRequest("Title is required");
  if (!message) return apiBadRequest("Message is required");
  if (title.length > 255) return apiBadRequest("Title must be at most 255 characters");
  if (!TYPE_MAP[typeStr]) return apiBadRequest("Invalid notification type");
  if (!TARGET_SET.has(target)) return apiBadRequest("Invalid target audience");

  const notifType = TYPE_MAP[typeStr];

  const makeRows = (ids: string[], field: RecipientField) =>
    ids.map((id) => ({
      id: randomUUID(),
      type: notifType,
      title,
      message,
      userId: field === "userId" ? id : null,
      sellerId: field === "sellerId" ? id : null,
      adminId: field === "adminId" ? id : null,
    }));

  async function insertInBatches(ids: string[], field: RecipientField) {
    if (ids.length === 0) return 0;
    const rows = makeRows(ids, field);
    let count = 0;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const slice = rows.slice(i, i + BATCH_SIZE);
      const r = await prisma.notification.createMany({ data: slice });
      count += r.count;
    }
    return count;
  }

  let sent = 0;

  if (target === "all_users" || target === "all_customers") {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });
    sent = await insertInBatches(
      users.map((u) => u.id),
      "userId"
    );
  } else if (target === "all_sellers") {
    const sellers = await prisma.seller.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });
    sent = await insertInBatches(
      sellers.map((s) => s.id),
      "sellerId"
    );
  } else {
    const admins = await prisma.admin.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });
    sent = await insertInBatches(
      admins.map((a) => a.id),
      "adminId"
    );
  }

  return apiSuccess({ sent, target, type: notifType }, Status.OK);
});
