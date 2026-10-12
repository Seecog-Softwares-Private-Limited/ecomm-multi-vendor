import { prisma } from "@/lib/prisma";
import { sendVendorApprovalEmail } from "@/lib/email/vendor-approval";
import { getSmsNotificationService } from "@/services/sms-notification.service";
import { SELLER_ACCOUNT_APPROVED_NOTIFICATION_TITLE } from "@/lib/notifications/vendor-notification-titles";

export { SELLER_ACCOUNT_APPROVED_NOTIFICATION_TITLE } from "@/lib/notifications/vendor-notification-titles";

/**
 * Notify a vendor on first approval: in-app notification, email, and SMS.
 * Best-effort — never throws to the approve API.
 */
export async function notifyVendorAccountApproved(sellerId: string): Promise<void> {
  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: {
      id: true,
      email: true,
      phone: true,
      businessName: true,
      ownerName: true,
    },
  });
  if (!seller) return;

  const name = seller.businessName?.trim() || seller.ownerName?.trim() || "Vendor";

  try {
    await prisma.notification.create({
      data: {
        type: "SELLER",
        title: SELLER_ACCOUNT_APPROVED_NOTIFICATION_TITLE,
        message:
          "Your vendor account has been approved. You can now list products and start selling.",
        sellerId: seller.id,
        metadata: { actionHref: "/vendor", actionLabel: "Open dashboard" },
      },
    });
  } catch (err) {
    console.error("[vendor-approval] in-app notification failed:", err);
  }

  if (seller.email?.trim()) {
    try {
      const { sent, error } = await sendVendorApprovalEmail(seller.email.trim(), name);
      if (!sent && error) {
        console.error("[vendor-approval] email failed:", error);
      }
    } catch (err) {
      console.error("[vendor-approval] email threw:", err);
    }
  }

  try {
    getSmsNotificationService().onVendorApproval({
      phone: seller.phone,
      name,
    });
  } catch (err) {
    console.error("[vendor-approval] SMS failed:", err);
  }
}
