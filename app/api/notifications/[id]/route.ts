import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiNotFound,
  apiUnauthorized,
  type ApiRouteContext,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import {
  markCustomerNotificationRead,
  deleteCustomerNotification,
} from "@/lib/notifications/customer-notifications";

/**
 * PATCH /api/notifications/:id — mark one notification as read.
 */
export const PATCH = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to manage notifications.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can manage notifications.");

  const params = context ? await context.params : {};
  const raw = params.id;
  const id = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
  if (!id) return apiNotFound("Notification not found");

  const ok = await markCustomerNotificationRead(session.sub, id);
  if (!ok) return apiNotFound("Notification not found");

  return apiSuccess({ id, read: true });
});

/**
 * DELETE /api/notifications/:id — soft delete notification.
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to manage notifications.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can manage notifications.");

  const params = context ? await context.params : {};
  const raw = params.id;
  const id = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
  if (!id) return apiNotFound("Notification not found");

  const ok = await deleteCustomerNotification(session.sub, id);
  if (!ok) return apiNotFound("Notification not found");

  return apiSuccess({ id, deleted: true });
});
