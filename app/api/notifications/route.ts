import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiForbidden, apiUnauthorized } from "@/lib/api";
import { assertCustomerAuthComplete } from "@/lib/auth";
import {
  listCustomerNotifications,
  markAllCustomerNotificationsRead,
} from "@/lib/notifications/customer-notifications";

/**
 * GET /api/notifications
 * Query: limit? (default 50, max 100)
 * Returns { notifications, unreadCount }
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await assertCustomerAuthComplete(request, {
    unauthorizedMessage: "Please log in to view notifications.",
    forbiddenMessage: "Only customers can view notifications.",
  });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50")));

  const payload = await listCustomerNotifications(session.sub, limit);
  return apiSuccess(payload);
});

/**
 * PATCH /api/notifications — mark all notifications as read.
 */
export const PATCH = withApiHandler(async (request: NextRequest) => {
  const session = await assertCustomerAuthComplete(request, {
    unauthorizedMessage: "Please log in to manage notifications.",
    forbiddenMessage: "Only customers can manage notifications.",
  });

  const updated = await markAllCustomerNotificationsRead(session.sub);
  return apiSuccess({ updated });
});
