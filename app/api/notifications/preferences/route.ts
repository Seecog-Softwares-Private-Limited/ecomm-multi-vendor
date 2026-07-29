import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiForbidden,
  apiUnauthorized,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/notifications/customer-notifications";

/**
 * GET /api/notifications/preferences
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can view preferences.");

  const preferences = await getNotificationPreferences(session.sub);
  return apiSuccess({ preferences });
});

/**
 * PATCH /api/notifications/preferences
 * Body: partial preference toggles
 */
export const PATCH = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can update preferences.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) return apiBadRequest("Body must be an object.");

  const b = body as Record<string, unknown>;
  const patch: Record<string, boolean> = {};
  const keys = [
    "orderUpdates",
    "payments",
    "offers",
    "wishlist",
    "security",
    "email",
    "sms",
    "push",
  ] as const;

  for (const key of keys) {
    if (b[key] !== undefined) {
      if (typeof b[key] !== "boolean") {
        return apiBadRequest(`${key} must be a boolean`);
      }
      patch[key] = b[key];
    }
  }

  if (Object.keys(patch).length === 0) {
    return apiBadRequest("Provide at least one preference to update.");
  }

  const preferences = await updateNotificationPreferences(session.sub, patch);
  return apiSuccess({ preferences });
});
