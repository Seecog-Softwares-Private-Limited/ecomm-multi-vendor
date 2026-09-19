import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
  apiConflict,
} from "@/lib/api";
import { getSession, verifyPassword, clearAuthCookie, assertCustomerAuthComplete } from "@/lib/auth";
import { hardDeleteCustomerAccount } from "@/lib/auth/delete-customer-account";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import { prisma } from "@/lib/prisma";
import { getUserAvatarUrlSafe } from "@/lib/data/user-avatar";
import {
  CUSTOMER_ONBOARDING_SELECT,
  customerAuthStatusFields,
  syncCustomerAuthOnboardingComplete,
} from "@/lib/auth/customer-onboarding";

const DELETE_CONFIRM_PHRASE = "DELETE";

/**
 * GET /api/auth/me — return current user from HTTP-only cookie (token verification).
 * Returns 200 with `{ user: null }` when there is no session (avoids 401 noise on public pages).
 * For CUSTOMER role also returns profile stats (orderCount, wishlistCount, addressCount).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) {
    // 200 + null user avoids noisy 401 in DevTools for every guest page load / session probe.
    return apiSuccess({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      ...CUSTOMER_ONBOARDING_SELECT,
      deletedAt: true,
      passwordHash: true,
      oauthProvider: true,
    },
  });

  if (!user || user.deletedAt) {
    return apiSuccess({ user: null });
  }

  const authOnboardingComplete =
    session.role === "CUSTOMER"
      ? await syncCustomerAuthOnboardingComplete(user.id)
      : user.authOnboardingComplete;

  const avatarUrl = await getUserAvatarUrlSafe(session.sub);
  const { deletedAt: _, passwordHash, ...rest } = user;
  const status = customerAuthStatusFields({
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    profileCompleted: user.profileCompleted,
    authOnboardingComplete,
  });
  const safeUser = {
    ...rest,
    avatarUrl,
    ...status,
    ...(session.role === "CUSTOMER" ? { hasPassword: Boolean(passwordHash) } : {}),
  };
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
  const session = await assertCustomerAuthComplete(request, {
    unauthorizedMessage: "Not authenticated",
    forbiddenMessage: "Only customers can update profile here.",
  });

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

  const updateData: {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    phoneVerified?: boolean;
    profileCompleted?: boolean;
    authOnboardingComplete?: boolean;
  } = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phoneRaw !== undefined) {
    if (phoneRaw === null) {
      updateData.phone = null;
      updateData.phoneVerified = false;
      updateData.profileCompleted = false;
      updateData.authOnboardingComplete = false;
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
      const current = await prisma.user.findFirst({
        where: { id: session.sub, deletedAt: null },
        select: { phone: true, phoneVerified: true },
      });
      updateData.phone = norm;
      // Changing phone requires a fresh OTP verification.
      if (!current || current.phone !== norm || !current.phoneVerified) {
        updateData.phoneVerified = false;
        updateData.authOnboardingComplete = false;
      }
    }
  }

  if (Object.keys(updateData).length === 0) {
    return apiBadRequest("Provide at least one of firstName, lastName, phone.");
  }

  await prisma.user.update({
    where: { id: session.sub },
    data: updateData,
  });

  await syncCustomerAuthOnboardingComplete(session.sub);

  return apiSuccess({ message: "Profile updated" });
});

/**
 * DELETE /api/auth/me — permanently delete the customer account and related data.
 * Body: { password?: string, confirm?: string }
 * - Email/password accounts: `password` required.
 * - OAuth-only accounts: `confirm` must be "DELETE".
 */
export const DELETE = withApiHandler(async (request: NextRequest) => {
  const session = await assertCustomerAuthComplete(request, {
    unauthorizedMessage: "Not authenticated",
    forbiddenMessage: "Only customers can delete their account here.",
  });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) {
    return apiBadRequest("Body must be an object.");
  }

  const b = body as Record<string, unknown>;
  const password = typeof b.password === "string" ? b.password : "";
  const confirm = typeof b.confirm === "string" ? b.confirm.trim() : "";

  const user = await prisma.user.findFirst({
    where: { id: session.sub, deletedAt: null },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    return apiForbidden("User not found");
  }

  if (user.passwordHash) {
    if (!password) {
      return apiBadRequest("Enter your password to confirm account deletion.");
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return apiBadRequest("Password is incorrect.");
    }
  } else if (confirm !== DELETE_CONFIRM_PHRASE) {
    return apiBadRequest(`Type ${DELETE_CONFIRM_PHRASE} to confirm account deletion.`);
  }

  const deleted = await hardDeleteCustomerAccount(user.id);
  if (!deleted) {
    return apiForbidden("User not found");
  }

  const response = apiSuccess({ message: "Account deleted successfully" });
  clearAuthCookie(response);
  return response;
});
