import { NextRequest } from "next/server";
import { ApiRouteError, Status } from "@/lib/api";
import { requireSession } from "./session";
import type { JwtPayload } from "./jwt";
import { prisma } from "@/lib/prisma";

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
 * Require vendor (SELLER) session and APPROVED status.
 * Use on all vendor-protected routes (dashboard, products, orders, finance, etc.).
 * Throws 403 "Account not approved" if status !== APPROVED.
 * Only SELLER role is allowed; ADMIN cannot use vendor data routes.
 */
export async function requireVendorApproved(
  request: NextRequest
): Promise<{ session: JwtPayload; sellerId: string }> {
  const session = await requireSession(request);
  if (session.role !== "SELLER") {
    throw new ApiRouteError("Vendor access required", Status.FORBIDDEN, "FORBIDDEN");
  }
  const sellerId = session.sub;
  if (!sellerId) {
    throw new ApiRouteError("Vendor not found", Status.NOT_FOUND, "NOT_FOUND");
  }

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
 */
export async function getVendorStatus(sellerId: string): Promise<{
  status: VendorStatusDisplay;
  statusReason: string | null;
  businessName: string | null;
  emailVerified: boolean;
} | null> {
  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { status: true, statusReason: true, businessName: true, emailVerified: true },
  });
  if (!seller) return null;
  return {
    status: toVendorStatusDisplay(seller.status),
    statusReason: seller.statusReason ?? null,
    businessName: seller.businessName ?? null,
    emailVerified: seller.emailVerified ?? false,
  };
}
