/**
 * Permanent vendor account deletion.
 *
 * Strategy (derived from Prisma schema FK audit):
 *
 * CASCADE-safe (onDelete: Cascade) — hard-deleted automatically when Seller is deleted,
 * but we do it explicitly so we can delete files BEFORE the DB rows:
 *   VendorDocument, KYCDocument, BankAccount, SellerServiceablePincode,
 *   VendorSupportTicket, Notification(seller)
 *
 * BLOCKING FKs (no onDelete rule, non-nullable sellerId) — keep Seller row:
 *   OrderItem, Return, Settlement, Payout
 *   → When any of these exist the Seller row CANNOT be hard-deleted.
 *   → Instead we ANONYMIZE the Seller row so personal data is gone.
 *
 * Product handling:
 *   - No OrderItem refs → hard-delete (cascades images/specs/variants/questions etc.)
 *   - Has OrderItem refs → soft-delete (deletedAt + INACTIVE status) to preserve order history
 *
 * ProductQuestion.answeredBySellerId — nullable FK, nullified before deletion.
 *
 * File deletion: files live on disk at public/uploads/. We collect URLs first,
 * delete DB rows in a transaction, then delete files. A file-deletion failure is
 * logged but does not roll back the DB deletion (files will be cleaned up on next sweep).
 */

import path from "node:path";
import { unlink } from "node:fs/promises";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPublicUploadsRoot } from "@/lib/uploads/storage";

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

/** Convert a public URL like https://host/uploads/kyc/foo.pdf → absolute disk path. */
function urlToDiskPath(fileUrl: string | null | undefined): string | null {
  if (!fileUrl) return null;
  try {
    const parsed = new URL(fileUrl);
    const pathname = parsed.pathname; // /uploads/kyc/foo.pdf
    // Strip leading /uploads/ prefix to get the relative path under public/uploads
    const rel = pathname.replace(/^\/uploads\//, "");
    if (!rel || rel === pathname) return null; // not an uploads URL
    return path.join(getPublicUploadsRoot(), rel);
  } catch {
    return null;
  }
}

async function safeDeleteFile(diskPath: string | null): Promise<void> {
  if (!diskPath) return;
  try {
    await unlink(diskPath);
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      // Log but don't throw — DB is already clean, stale file is acceptable.
      console.warn(`[deleteVendorAccount] Could not delete file ${diskPath}:`, err);
    }
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export type DeleteVendorResult =
  | { deleted: true; mode: "hard" | "anonymized" }
  | { deleted: false; reason: string };

/**
 * Permanently remove a vendor account and associated personal data.
 * Returns whether the Seller row was hard-deleted or anonymized.
 */
export async function deleteVendorAccount(sellerId: string): Promise<DeleteVendorResult> {
  // ── Phase 0: Collect file URLs before any DB mutation ──────────────────────
  const [vendorDocs, kycDocs] = await Promise.all([
    prisma.vendorDocument.findMany({
      where: { sellerId },
      select: { id: true, documentUrl: true },
    }),
    prisma.kYCDocument.findMany({
      where: { sellerId },
      select: { id: true, fileUrl: true },
    }),
  ]);

  const filePathsToDelete: string[] = [
    ...vendorDocs.map((d) => urlToDiskPath(d.documentUrl)).filter(Boolean) as string[],
    ...kycDocs.map((d) => urlToDiskPath(d.fileUrl)).filter(Boolean) as string[],
  ];

  // ── Phase 1: DB operations in a transaction ─────────────────────────────────
  const mode = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const seller = await tx.seller.findFirst({
      where: { id: sellerId },
      select: { id: true, passwordHash: true },
    });
    if (!seller) throw new Error("Seller not found");

    // 1a. Nullify answeredBySellerId (nullable FK — safe to SET NULL)
    await tx.productQuestion.updateMany({
      where: { answeredBySellerId: sellerId },
      data: { answeredBySellerId: null },
    });

    // 1b. Delete vendor-only data with no blocking FKs
    await tx.notification.deleteMany({ where: { sellerId } });
    await tx.vendorSupportTicket.deleteMany({ where: { sellerId } });
    await tx.sellerServiceablePincode.deleteMany({ where: { sellerId } });
    await tx.vendorDocument.deleteMany({ where: { sellerId } });
    await tx.kYCDocument.deleteMany({ where: { sellerId } });
    await tx.bankAccount.deleteMany({ where: { sellerId } });

    // 1c. Product handling
    const allProducts = await tx.product.findMany({
      where: { sellerId },
      select: {
        id: true,
        _count: { select: { orderItems: true } },
      },
    });

    const noOrderItems = allProducts.filter((p) => p._count.orderItems === 0).map((p) => p.id);
    const hasOrderItems = allProducts.filter((p) => p._count.orderItems > 0).map((p) => p.id);

    // Hard-delete products with no order references (cascade cleans sub-tables)
    if (noOrderItems.length > 0) {
      await tx.product.deleteMany({ where: { id: { in: noOrderItems } } });
    }

    // Soft-delete products referenced by orders — preserve order history
    if (hasOrderItems.length > 0) {
      await tx.product.updateMany({
        where: { id: { in: hasOrderItems } },
        data: { deletedAt: new Date(), status: "INACTIVE" },
      });
    }

    // 1d. Check for blocking FK references that prevent hard-deleting the Seller row
    const [orderItemCount, returnCount, settlementCount, payoutCount] = await Promise.all([
      tx.orderItem.count({ where: { sellerId } }),
      tx.return.count({ where: { sellerId } }),
      tx.settlement.count({ where: { sellerId } }),
      tx.payout.count({ where: { sellerId } }),
    ]);

    const hasBlockingRefs =
      orderItemCount > 0 || returnCount > 0 || settlementCount > 0 || payoutCount > 0;

    if (hasBlockingRefs) {
      // ANONYMIZE — cannot hard-delete due to FK constraints from order/financial records
      await tx.seller.update({
        where: { id: sellerId },
        data: {
          email: `deleted-${sellerId}@deleted.invalid`,
          passwordHash: "",
          businessName: "Deleted Vendor",
          ownerName: "Deleted",
          phone: null,
          appleUserId: null,
          oauthProvider: null,
          oauthProviderId: null,
          passwordResetToken: null,
          passwordResetExpires: null,
          verificationToken: null,
          verificationTokenExpires: null,
          emailOtpCode: null,
          emailOtpExpires: null,
          phoneOtpCode: null,
          phoneOtpExpires: null,
          status: "SUSPENDED",
          deletedAt: new Date(),
        },
      });
      return "anonymized" as const;
    }

    // HARD DELETE — no blocking FK references
    await tx.seller.delete({ where: { id: sellerId } });
    return "hard" as const;
  });

  // ── Phase 2: Delete files AFTER successful DB transaction ───────────────────
  await Promise.all(filePathsToDelete.map(safeDeleteFile));

  return { deleted: true, mode };
}
