/**
 * Phase 4 — Customer account-completion gate.
 *
 * Source of truth: User.authOnboardingComplete in the database (not JWT claims).
 * Customer App (HttpOnly env cookie) may soft-pass without phone — phone is
 * enforced at order creation instead.
 */

import { NextRequest } from "next/server";
import { ApiRouteError, Status } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import type { JwtPayload } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";
import { isCustomerAppRequest } from "@/lib/auth/customer-app-cookie";
import { computeCustomerAppAuthReady } from "@/lib/auth/customer-onboarding";

export const ACCOUNT_INCOMPLETE_MESSAGE =
  "Complete your account setup to continue.";

export type AssertCustomerAuthCompleteOptions = {
  /** 401 message when no session */
  unauthorizedMessage?: string;
  /** 403 message when role is not CUSTOMER */
  forbiddenMessage?: string;
};

/**
 * Require an authenticated Customer whose DB `authOnboardingComplete` is true.
 *
 * Customer App exception: if the env cookie is present and the user has
 * name + real verified email (phone optional), allow commerce APIs.
 *
 * Order: session → CUSTOMER role → DB completeness (or App soft ready).
 * Throws ApiRouteError (caught by withApiHandler):
 * - 401 UNAUTHORIZED
 * - 403 FORBIDDEN (wrong role)
 * - 403 ACCOUNT_INCOMPLETE (incomplete onboarding)
 */
export async function assertCustomerAuthComplete(
  request: NextRequest,
  opts: AssertCustomerAuthCompleteOptions = {}
): Promise<JwtPayload> {
  const session = await getSession(request);
  if (!session) {
    throw new ApiRouteError(
      opts.unauthorizedMessage ?? "Not authenticated",
      Status.UNAUTHORIZED,
      "UNAUTHORIZED"
    );
  }
  if (session.role !== "CUSTOMER") {
    throw new ApiRouteError(
      opts.forbiddenMessage ?? "Customer access required",
      Status.FORBIDDEN,
      "FORBIDDEN"
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: session.sub, deletedAt: null },
    select: {
      id: true,
      authOnboardingComplete: true,
      firstName: true,
      lastName: true,
      email: true,
      emailVerified: true,
    },
  });

  if (!user) {
    throw new ApiRouteError(
      opts.unauthorizedMessage ?? "User not found",
      Status.UNAUTHORIZED,
      "UNAUTHORIZED"
    );
  }

  if (user.authOnboardingComplete) {
    return session;
  }

  if (
    isCustomerAppRequest(request) &&
    computeCustomerAppAuthReady(user)
  ) {
    return session;
  }

  throw new ApiRouteError(
    ACCOUNT_INCOMPLETE_MESSAGE,
    Status.FORBIDDEN,
    "ACCOUNT_INCOMPLETE",
    { needsAuthOnboarding: true }
  );
}

/**
 * Non-throwing variant for handlers that prefer early `return` responses.
 * Returns either the session or a NextResponse error (via api helpers).
 */
export async function requireCompleteCustomerSession(
  request: NextRequest,
  opts: AssertCustomerAuthCompleteOptions = {}
): Promise<
  | { ok: true; session: JwtPayload }
  | { ok: false; response: import("next/server").NextResponse }
> {
  try {
    const session = await assertCustomerAuthComplete(request, opts);
    return { ok: true, session };
  } catch (e) {
    if (e instanceof ApiRouteError) {
      const { apiError } = await import("@/lib/api/response");
      return {
        ok: false,
        response: apiError(
          e.message,
          e.status as import("@/lib/api").StatusCode,
          e.code,
          e.details
        ),
      };
    }
    throw e;
  }
}
