import { prisma } from "@/lib/prisma";
import { notifyVendorAccountApproved } from "@/lib/notifications/vendor-approval";

type VendorStatusAction = "approve" | "unblock" | "reject" | "block" | "hold";

/**
 * Notify vendor about account status changes (in-app; approval also email+SMS).
 * Best-effort; never throws.
 */
export async function notifyVendorStatusChange(input: {
  sellerId: string;
  action: VendorStatusAction;
  reason?: string | null;
  /** When true, seller was already APPROVED before this action. */
  wasAlreadyApproved?: boolean;
}): Promise<void> {
  const { sellerId, action, reason } = input;

  if (action === "approve" || action === "unblock") {
    if (!input.wasAlreadyApproved) {
      await notifyVendorAccountApproved(sellerId);
    }
    return;
  }

  const title =
    action === "reject"
      ? "Vendor account rejected"
      : action === "block"
        ? "Vendor account suspended"
        : "Vendor account on hold";

  const reasonText = reason?.trim();
  const message =
    action === "reject"
      ? reasonText
        ? `Your vendor account was rejected. Reason: ${reasonText}`
        : "Your vendor account was rejected. Please update your profile and resubmit."
      : action === "block"
        ? reasonText
          ? `Your vendor account has been suspended. Reason: ${reasonText}`
          : "Your vendor account has been suspended. Contact support for help."
        : reasonText
          ? `Your vendor account is on hold. Reason: ${reasonText}`
          : "Your vendor account is on hold pending review.";

  try {
    await prisma.notification.create({
      data: {
        type: "SELLER",
        title,
        message: message.slice(0, 2000),
        sellerId,
        metadata: {
          actionHref: "/vendor/profile",
          actionLabel: "View profile",
        },
      },
    });
  } catch (err) {
    console.error("[vendor-status] in-app notification failed:", err);
  }
}
