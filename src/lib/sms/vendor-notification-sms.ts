/**
 * Vendor SMS alerts triggered from admin approval APIs.
 *
 * SMS trigger points:
 * - `POST /api/admin/sellers/[sellerId]/kyc/approve` → notifyVendorApprovedSms()
 * - `POST /api/admin/products/[productId]/approve` → notifyProductApprovedSms()
 */

import { sendSMSAsync } from "@/lib/sendSMS";

const VENDOR_APPROVED_MESSAGE =
  "Congratulations! Your IndoVyapar vendor account has been approved. You can now start selling on IndoVyapar.";

export function buildProductApprovedMessage(productName: string): string {
  const name = productName.trim().slice(0, 80) || "Your product";
  return `Good news! Your product '${name}' has been approved and is now live on IndoVyapar.`;
}

/**
 * SMS when admin approves vendor account (pending → APPROVED).
 * Non-blocking; safe to call after DB commit.
 */
export function notifyVendorApprovedSms(phone: string | null | undefined): void {
  if (!phone?.trim()) {
    console.warn("[vendor-notification-sms] Vendor approval SMS skipped — no phone on file");
    return;
  }
  sendSMSAsync(phone, VENDOR_APPROVED_MESSAGE, "vendor_approved");
}

/**
 * SMS when admin approves a product (PENDING_APPROVAL → ACTIVE).
 */
export function notifyProductApprovedSms(
  phone: string | null | undefined,
  productName: string
): void {
  if (!phone?.trim()) {
    console.warn("[vendor-notification-sms] Product approval SMS skipped — vendor has no phone");
    return;
  }
  sendSMSAsync(phone, buildProductApprovedMessage(productName), "product_approved");
}
