import { prisma } from "@/lib/prisma";
import { getSmsNotificationService } from "@/services/sms-notification.service";

/** Vendor notification title when a product is approved (keep in sync with approve API + vendor UI). */
export const SELLER_PRODUCT_APPROVED_NOTIFICATION_TITLE = "Product approved";

/** Vendor notification title when a product is rejected. */
export const SELLER_PRODUCT_REJECTED_NOTIFICATION_TITLE = "Product rejected";

/**
 * In-app (+ optional SMS) when a product is approved.
 * Best-effort; never throws.
 */
export async function notifyVendorProductApproved(input: {
  productId: string;
  sellerId: string;
  productName: string;
  phone?: string | null;
  sendSms?: boolean;
}): Promise<void> {
  const name = input.productName.trim() || "Your product";
  try {
    await prisma.notification.create({
      data: {
        type: "SELLER",
        title: SELLER_PRODUCT_APPROVED_NOTIFICATION_TITLE,
        message: `"${name}" has been approved and is now live in the storefront.`,
        sellerId: input.sellerId,
        metadata: {
          productId: input.productId,
          actionHref: "/vendor/products",
          actionLabel: "View products",
        },
      },
    });
  } catch (err) {
    console.error("[product-moderation] approve in-app failed:", err);
  }

  if (input.sendSms) {
    try {
      getSmsNotificationService().onProductApproval({
        phone: input.phone,
        productName: name,
      });
    } catch (err) {
      console.error("[product-moderation] approve SMS failed:", err);
    }
  }
}

/**
 * In-app when a product is rejected. Best-effort; never throws.
 */
export async function notifyVendorProductRejected(input: {
  productId: string;
  sellerId: string;
  productName: string;
  reason?: string | null;
}): Promise<void> {
  const name = input.productName.trim() || "Your product";
  const reason = input.reason?.trim();
  const message = reason
    ? `"${name}" was rejected. Reason: ${reason}`
    : `"${name}" was rejected. Please update and resubmit.`;

  try {
    await prisma.notification.create({
      data: {
        type: "SELLER",
        title: SELLER_PRODUCT_REJECTED_NOTIFICATION_TITLE,
        message: message.slice(0, 2000),
        sellerId: input.sellerId,
        metadata: {
          productId: input.productId,
          actionHref: "/vendor/products",
          actionLabel: "View products",
        },
      },
    });
  } catch (err) {
    console.error("[product-moderation] reject in-app failed:", err);
  }
}
