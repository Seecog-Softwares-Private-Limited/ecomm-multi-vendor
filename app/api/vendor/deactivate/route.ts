import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiForbidden,
  apiBadRequest,
  apiNotFound,
} from "@/lib/api";
import { requireSession, verifyPassword, clearAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEACTIVATE_CONFIRM_PHRASE = "DEACTIVATE";
const SELF_DEACTIVATE_REASON = "Self-deactivated by vendor";

/**
 * POST /api/vendor/deactivate — vendor self-service account deactivation.
 * Sets seller status to ON_HOLD, hides active products, and clears session.
 * Body: { password?: string, confirm?: string }
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await requireSession(request);
  if (session.role !== "SELLER") {
    return apiForbidden("Vendor access required");
  }

  const sellerId = session.sub?.trim() ?? "";
  if (!sellerId) {
    return apiNotFound("Vendor not found");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) {
    return apiBadRequest("Body must be an object.");
  }

  const b = body as Record<string, unknown>;
  const password = typeof b.password === "string" ? b.password : "";
  const confirm = typeof b.confirm === "string" ? b.confirm.trim() : "";

  const seller = await prisma.seller.findFirst({
    where: { id: sellerId, deletedAt: null },
    select: { id: true, passwordHash: true, status: true },
  });

  if (!seller) {
    return apiNotFound("Vendor not found");
  }

  if (seller.status === "ON_HOLD" || seller.status === "SUSPENDED") {
    return apiBadRequest("Your account is already deactivated or suspended.");
  }

  const hash = seller.passwordHash?.trim() ?? "";
  const hasUsablePassword = hash.length >= 20;

  if (hasUsablePassword) {
    if (!password) {
      return apiBadRequest("Enter your password to confirm account deactivation.");
    }
    let valid = false;
    try {
      valid = await verifyPassword(password, hash);
    } catch {
      valid = false;
    }
    if (!valid) {
      return apiBadRequest("Password is incorrect.");
    }
  } else if (confirm !== DEACTIVATE_CONFIRM_PHRASE) {
    return apiBadRequest(`Type ${DEACTIVATE_CONFIRM_PHRASE} to confirm account deactivation.`);
  }

  await prisma.$transaction([
    prisma.seller.update({
      where: { id: sellerId },
      data: {
        status: "ON_HOLD",
        statusReason: SELF_DEACTIVATE_REASON,
      },
    }),
    prisma.product.updateMany({
      where: {
        sellerId,
        deletedAt: null,
        status: "ACTIVE",
      },
      data: { status: "INACTIVE" },
    }),
  ]);

  const response = apiSuccess({ message: "Account deactivated successfully" });
  clearAuthCookie(response);
  return response;
});
