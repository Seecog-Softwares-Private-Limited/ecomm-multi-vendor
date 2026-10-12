import { prisma } from "@/lib/prisma";
import { sellerHasRealEmail } from "@/lib/auth/seller-onboarding";
import { sendVendorNewOrderEmail } from "@/lib/email/vendor-new-order";

function variantLabelFromSnapshot(snapshot: unknown): string | null {
  if (!snapshot || typeof snapshot !== "object") return null;
  const raw = (snapshot as { raw?: unknown }).raw;
  if (typeof raw !== "string" || !raw.trim()) return null;
  return raw
    .split("|")
    .map((part) => part.replace(/^(Color|Size|Storage):/i, "").trim())
    .filter(Boolean)
    .join(" / ");
}

type SellerBucket = {
  sellerId: string;
  email: string | null;
  vendorName: string;
  lines: Array<{
    productName: string;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    variantLabel: string | null;
  }>;
};

/**
 * Notify each seller who has items on this order:
 * - in-app notification (always)
 * - email when the seller has a real mailbox
 *
 * Safe to call fire-and-forget; never throws to the caller.
 */
export async function notifyVendorsOfNewOrder(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        shippingAddress: {
          select: {
            fullName: true,
            phone: true,
            line1: true,
            line2: true,
            city: true,
            state: true,
            pincode: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { mode: true },
        },
        items: {
          select: {
            sellerId: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            sku: true,
            variantSnapshot: true,
            product: { select: { name: true } },
            seller: {
              select: {
                email: true,
                businessName: true,
                ownerName: true,
                deletedAt: true,
              },
            },
          },
        },
      },
    });

    if (!order || order.items.length === 0) return;

    const bySeller = new Map<string, SellerBucket>();

    for (const item of order.items) {
      if (item.seller.deletedAt) continue;

      let bucket = bySeller.get(item.sellerId);
      if (!bucket) {
        const email = sellerHasRealEmail(item.seller.email)
          ? item.seller.email.trim().toLowerCase()
          : null;
        bucket = {
          sellerId: item.sellerId,
          email,
          vendorName:
            item.seller.businessName?.trim() ||
            item.seller.ownerName?.trim() ||
            "Vendor",
          lines: [],
        };
        bySeller.set(item.sellerId, bucket);
      }

      bucket.lines.push({
        productName: item.product.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        variantLabel: variantLabelFromSnapshot(item.variantSnapshot),
      });
    }

    if (bySeller.size === 0) {
      console.warn("[vendor-order-notify] No active sellers for order", orderId);
      return;
    }

    const addr = order.shippingAddress;
    const shippingLines = [
      addr.line1,
      addr.line2?.trim() || null,
      `${addr.city}, ${addr.state} ${addr.pincode}`,
    ].filter((x): x is string => Boolean(x && x.trim()));

    const orderShortId = order.id.slice(0, 8).toUpperCase();
    const paymentMode = order.payments[0]?.mode ?? "COD";
    const itemCountLabel = (n: number) => `${n} item${n === 1 ? "" : "s"}`;

    // In-app notifications for every seller on the order (even without email).
    try {
      await prisma.notification.createMany({
        data: [...bySeller.values()].map((seller) => ({
          type: "ORDER" as const,
          title: `New order #${orderShortId}`,
          message: `You received ${itemCountLabel(seller.lines.length)} in order #${orderShortId} (${paymentMode}).`,
          sellerId: seller.sellerId,
          metadata: {
            orderId: order.id,
            actionHref: `/vendor/orders/${order.id}`,
            actionLabel: "View order",
          },
        })),
      });
    } catch (err) {
      console.error("[vendor-order-notify] in-app createMany failed", orderId, err);
    }

    await Promise.all(
      [...bySeller.values()].map(async (seller) => {
        if (!seller.email) return;
        const sellerSubtotal = seller.lines.reduce((s, l) => s + l.totalPrice, 0);
        const result = await sendVendorNewOrderEmail({
          to: seller.email,
          vendorName: seller.vendorName,
          orderId: order.id,
          orderShortId,
          paymentMode,
          orderStatus: order.status,
          customerName: addr.fullName,
          customerPhone: addr.phone,
          shippingLines,
          lines: seller.lines,
          sellerSubtotal,
        });
        if (!result.sent) {
          console.warn(
            "[vendor-order-email] Not sent to",
            seller.email,
            result.error ?? "(SMTP disabled or failed)"
          );
        }
      })
    );
  } catch (err) {
    console.error("[vendor-order-notify] Failed for order", orderId, err);
  }
}
