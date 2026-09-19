/**
 * Phase 4 — Vendor account-completion gate (auth onboarding only).
 * Source of truth: Seller.authOnboardingComplete in the database.
 * Does NOT check KYC / admin approval (see requireVendorApproved).
 */

import { NextRequest } from "next/server";
import { ApiRouteError, Status } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
import type { JwtPayload } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export const SELLER_ACCOUNT_INCOMPLETE_MESSAGE =
  "Complete your account setup to continue.";

export type AssertSellerAuthCompleteOptions = {
  unauthorizedMessage?: string;
  forbiddenMessage?: string;
};

/**
 * Require authenticated SELLER with DB authOnboardingComplete === true.
 * Order: session → SELLER role → DB completeness.
 */
export async function assertSellerAuthComplete(
  request: NextRequest,
  opts: AssertSellerAuthCompleteOptions = {}
): Promise<{ session: JwtPayload; sellerId: string }> {
  const session = await getSession(request);
  if (!session) {
    throw new ApiRouteError(
      opts.unauthorizedMessage ?? "Not authenticated",
      Status.UNAUTHORIZED,
      "UNAUTHORIZED"
    );
  }
  if (session.role !== "SELLER") {
    throw new ApiRouteError(
      opts.forbiddenMessage ?? "Vendor access required",
      Status.FORBIDDEN,
      "FORBIDDEN"
    );
  }

  const sellerId = session.sub?.trim() ?? "";
  if (!sellerId) {
    throw new ApiRouteError(
      opts.unauthorizedMessage ?? "Vendor not found",
      Status.UNAUTHORIZED,
      "UNAUTHORIZED"
    );
  }

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { id: true, authOnboardingComplete: true },
  });

  if (!seller) {
    throw new ApiRouteError(
      opts.unauthorizedMessage ?? "Vendor not found",
      Status.UNAUTHORIZED,
      "UNAUTHORIZED"
    );
  }

  if (!seller.authOnboardingComplete) {
    throw new ApiRouteError(
      SELLER_ACCOUNT_INCOMPLETE_MESSAGE,
      Status.FORBIDDEN,
      "ACCOUNT_INCOMPLETE",
      { needsAuthOnboarding: true }
    );
  }

  return { session, sellerId: seller.id };
}
