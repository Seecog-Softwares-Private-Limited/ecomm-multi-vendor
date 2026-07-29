import type { SellerStatus } from "@prisma/client";
import { ApiRouteError } from "@/lib/api";
import { Status } from "@/lib/api/status";

const SELLER_STATUS_MESSAGES: Partial<Record<SellerStatus, string>> = {
  PENDING_VERIFICATION: "This product's seller is not yet verified.",
  DRAFT: "This product's seller is not active.",
  SUBMITTED: "This product's seller is awaiting approval.",
  UNDER_REVIEW: "This product's seller is under review.",
  REJECTED: "This product's seller is no longer available.",
  SUSPENDED: "This product's seller is temporarily suspended.",
  ON_HOLD: "This product's seller is on hold.",
};

export type SellerValidationRow = {
  id: string;
  status: SellerStatus;
  deletedAt: Date | null;
  businessName: string;
};

export function assertSellerCanSell(seller: SellerValidationRow, productName?: string): void {
  const label = productName ? `"${productName}"` : "One or more items";

  if (seller.deletedAt != null) {
    throw new ApiRouteError(
      `${label} is unavailable because the seller no longer exists.`,
      Status.BAD_REQUEST,
      "SELLER_UNAVAILABLE"
    );
  }

  if (seller.status !== "APPROVED") {
    const reason =
      SELLER_STATUS_MESSAGES[seller.status] ??
      `${label} is unavailable because the seller is not approved.`;
    throw new ApiRouteError(reason, Status.BAD_REQUEST, "SELLER_NOT_APPROVED");
  }
}

export function validateSellersForProducts(
  products: Array<{ name: string; seller: SellerValidationRow }>
): void {
  for (const p of products) {
    assertSellerCanSell(p.seller, p.name);
  }
}
