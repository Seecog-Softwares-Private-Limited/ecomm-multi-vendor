import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, createAuditLog } from "@/lib/superadmin-auth";
import { getSmsNotificationService } from "@/services/sms-notification.service";

/**
 * PUT /api/superadmin/sellers/[sellerId]/status
 * Body: { action: "approve" | "reject" | "block" | "unblock" | "hold", reason?: string }
 */
export async function PUT(request: NextRequest, context: { params: Promise<{ sellerId: string }> }) {
  const { session, errorResponse } = await requireSuperAdmin(request);
  if (errorResponse) return errorResponse;

  const { sellerId } = await context.params;
  if (!sellerId?.trim()) {
    return Response.json({ success: false, message: "Seller not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action.toLowerCase() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 2000) : undefined;

  const statusMap: Record<string, "APPROVED" | "REJECTED" | "SUSPENDED" | "ON_HOLD"> = {
    approve: "APPROVED",
    reject: "REJECTED",
    block: "SUSPENDED",
    unblock: "APPROVED",
    hold: "ON_HOLD",
  };
  const status = statusMap[action];
  if (!status) {
    return Response.json({ success: false, message: "Invalid action" }, { status: 400 });
  }
  const requiresReason = action === "reject" || action === "block" || action === "hold";
  if (requiresReason && !reason) {
    return Response.json({ success: false, message: "Reason is required for this action" }, { status: 400 });
  }

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: {
      id: true,
      email: true,
      status: true,
      phone: true,
      businessName: true,
      ownerName: true,
    },
  });
  if (!seller) {
    return Response.json({ success: false, message: "Seller not found" }, { status: 404 });
  }

  const wasAlreadyApproved = seller.status === "APPROVED";

  if (action === "approve" || action === "unblock") {
    await prisma.$transaction([
      prisma.kYCDocument.updateMany({
        where: { sellerId },
        data: { status: "APPROVED" },
      }),
      prisma.seller.update({
        where: { id: sellerId },
        data: { status: "APPROVED", statusReason: null },
      }),
    ]);

    if (!wasAlreadyApproved) {
      getSmsNotificationService().onVendorApproval({
        phone: seller.phone,
        name: seller.businessName ?? seller.ownerName ?? "Vendor",
      });
    }
  } else {
    await prisma.seller.update({
      where: { id: sellerId },
      data: {
        status,
        statusReason: reason ?? null,
      },
    });
  }

  await createAuditLog(session.id, session.email, `seller_${action}`, "sellers", { sellerId }, request);

  const updatedStatus = action === "approve" || action === "unblock" ? "APPROVED" : status;
  const updatedReason = action === "approve" || action === "unblock" ? null : reason ?? null;

  return Response.json({
    success: true,
    data: { sellerId, status: updatedStatus, statusReason: updatedReason },
  });
}
