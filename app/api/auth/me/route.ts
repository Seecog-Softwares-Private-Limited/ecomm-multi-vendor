import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
  apiConflict,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/me — return current user from HTTP-only cookie (token verification).
 * For CUSTOMER role also returns profile stats (orderCount, wishlistCount, addressCount).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) {
    return apiUnauthorized("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt) {
    return apiUnauthorized("User not found");
  }

  const { deletedAt: _, ...safeUser } = user;
  const payload: { user: typeof safeUser & { role: string }; stats?: { orderCount: number; wishlistCount: number; addressCount: number } } = {
    user: { ...safeUser, role: session.role },
  };

  if (session.role === "CUSTOMER") {
    const [orderCount, wishlistCount, addressCount] = await Promise.all([
      prisma.order.count({ where: { userId: session.sub } }),
      prisma.wishlistItem.count({ where: { userId: session.sub, deletedAt: null } }),
      prisma.address.count({ where: { userId: session.sub, deletedAt: null } }),
    ]);
    payload.stats = { orderCount, wishlistCount, addressCount };
  }

  return apiSuccess(payload);
});

/**
 * PATCH /api/auth/me — update current user profile (customer only).
 * Body: { firstName?: string, lastName?: string, phone?: string }
 */
export const PATCH = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Not authenticated");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can update profile here.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) return apiBadRequest("Body must be an object.");

  const b = body as Record<string, unknown>;
  const firstName = typeof b.firstName === "string" ? b.firstName.trim() || null : undefined;
  const lastName = typeof b.lastName === "string" ? b.lastName.trim() || null : undefined;
  const phoneRaw = typeof b.phone === "string" ? b.phone.trim() || null : undefined;

  const updateData: { firstName?: string | null; lastName?: string | null; phone?: string | null } = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phoneRaw !== undefined) {
    if (phoneRaw === null) {
      updateData.phone = null;
    } else {
      const norm = normalizeIndianPhone(phoneRaw);
      if (!norm) {
        return apiBadRequest(INDIAN_MOBILE_HINT);
      }
      const taken = await prisma.user.findFirst({
        where: { phone: norm, deletedAt: null, id: { not: session.sub } },
        select: { id: true },
      });
      if (taken) {
        return apiConflict("This phone number is already used by another account.");
      }
      updateData.phone = norm;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return apiBadRequest("Provide at least one of firstName, lastName, phone.");
  }

  await prisma.user.update({
    where: { id: session.sub },
    data: updateData,
  });

  return apiSuccess({ message: "Profile updated" });
});
