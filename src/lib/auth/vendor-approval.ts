import { NextRequest } from "next/server";
import { ApiRouteError, Status } from "@/lib/api";
import type { JwtPayload } from "./jwt";
import { prisma } from "@/lib/prisma";
import { resolveDashboardDisplayName } from "@/lib/data/vendor-profile";

/** Vendor status as exposed to frontend (aligned with requirement labels). */
export type VendorStatusDisplay =
  | "pending_verification"
  | "under_review"
  | "approved"
  | "rejected"
  | "on_hold"
  | "blocked";

const STATUS_MAP: Record<string, VendorStatusDisplay> = {
  PENDING_VERIFICATION: "pending_verification",
  DRAFT: "under_review",
  SUBMITTED: "under_review",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  ON_HOLD: "on_hold",
  SUSPENDED: "blocked",
};

export function toVendorStatusDisplay(dbStatus: string): VendorStatusDisplay {
  return STATUS_MAP[dbStatus] ?? "pending_verification";
}

/**
 * Require vendor (SELLER) session, auth onboarding complete, and APPROVED status.
 * Order: Authentication → SELLER → authOnboardingComplete → APPROVED.
 * Only SELLER role is allowed; ADMIN cannot use vendor data routes.
 */
export async function requireVendorApproved(
  request: NextRequest
): Promise<{ session: JwtPayload; sellerId: string }> {
  const { assertSellerAuthComplete } = await import(
    "@/lib/auth/assert-seller-auth-complete"
  );
  const { session, sellerId } = await assertSellerAuthComplete(request);

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { status: true },
  });
  if (!seller) {
    throw new ApiRouteError("Vendor not found", Status.NOT_FOUND, "NOT_FOUND");
  }
  if (seller.status !== "APPROVED") {
    throw new ApiRouteError("Account not approved", Status.FORBIDDEN, "ACCOUNT_NOT_APPROVED");
  }
  return { session, sellerId };
}

/**
 * Get vendor status for display (e.g. /api/vendor/me, status screen).
 * Does not throw; returns status and reason. Use when you need to show status to unapproved vendors.
 * rawStatus (DRAFT, SUBMITTED, etc.) lets the frontend show "Complete profile & KYC" for DRAFT vs "Under review" for SUBMITTED.
 */
export async function getVendorStatus(sellerId: string): Promise<{
  status: VendorStatusDisplay;
  rawStatus: string;
  statusReason: string | null;
  businessName: string | null;
  emailVerified: boolean;
} | null> {
  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { status: true, statusReason: true, businessName: true, emailVerified: true, profileExtras: true },
  });
  if (!seller) return null;
  return {
    status: toVendorStatusDisplay(seller.status),
    rawStatus: seller.status,
    statusReason: seller.statusReason ?? null,
    businessName: resolveDashboardDisplayName(seller.businessName, seller.profileExtras),
    emailVerified: seller.emailVerified ?? false,
  };
}
