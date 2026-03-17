import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  type ApiRouteContext,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressType } from "@prisma/client";

/**
 * PATCH /api/addresses/[id] — update an address (customer's own).
 * Body: { fullName?, phone?, line1?, line2?, city?, state?, pincode?, type?, isDefault? }
 */
export const PATCH = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to update the address.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can update addresses.");

  const params = context ? await context.params : {};
  const id = typeof params.id === "string" ? params.id : undefined;
  if (!id?.trim()) return apiBadRequest("Address id is required.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) return apiBadRequest("Body must be an object.");

  const existing = await prisma.address.findFirst({
    where: { id, userId: session.sub, deletedAt: null },
  });
  if (!existing) return apiNotFound("Address not found.");

  const b = body as Record<string, unknown>;
  const fullName = b.fullName !== undefined ? (typeof b.fullName === "string" ? b.fullName.trim() : null) : null;
  const phone = b.phone !== undefined ? (typeof b.phone === "string" ? b.phone.trim() : null) : null;
  const line1 = b.line1 !== undefined ? (typeof b.line1 === "string" ? b.line1.trim() : null) : null;
  const line2 = b.line2 !== undefined ? (typeof b.line2 === "string" ? b.line2.trim() || null : null) : undefined;
  const city = b.city !== undefined ? (typeof b.city === "string" ? b.city.trim() : null) : null;
  const state = b.state !== undefined ? (typeof b.state === "string" ? b.state.trim() : null) : null;
  const pincode = b.pincode !== undefined ? (typeof b.pincode === "string" ? b.pincode.trim() : null) : null;
  const typeStr = b.type !== undefined && typeof b.type === "string" ? b.type.toUpperCase() : null;
  const type: AddressType | null =
    typeStr === "OFFICE" ? "OFFICE" : typeStr === "OTHER" ? "OTHER" : typeStr === "HOME" ? "HOME" : null;
  const isDefault = b.isDefault === true ? true : b.isDefault === false ? false : undefined;

  if (fullName !== null && !fullName) return apiBadRequest("fullName cannot be empty.");
  if (phone !== null && !phone) return apiBadRequest("phone cannot be empty.");
  if (line1 !== null && !line1) return apiBadRequest("line1 cannot be empty.");
  if (city !== null && !city) return apiBadRequest("city cannot be empty.");
  if (state !== null && !state) return apiBadRequest("state cannot be empty.");
  if (pincode !== null && !pincode) return apiBadRequest("pincode cannot be empty.");

  if (isDefault === true) {
    await prisma.address.updateMany({
      where: { userId: session.sub },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data: {
      ...(fullName !== null && { fullName }),
      ...(phone !== null && { phone }),
      ...(line1 !== null && { line1 }),
      ...(line2 !== undefined && { line2 }),
      ...(city !== null && { city }),
      ...(state !== null && { state }),
      ...(pincode !== null && { pincode }),
      ...(type !== null && { type }),
      ...(isDefault !== undefined && { isDefault }),
    },
    select: {
      id: true,
      type: true,
      fullName: true,
      line1: true,
      line2: true,
      city: true,
      state: true,
      pincode: true,
      phone: true,
      isDefault: true,
    },
  });

  const name = address.type === "HOME" ? "Home" : address.type === "OFFICE" ? "Office" : "Other";
  const addressStr = [address.line1, address.line2, `${address.city}, ${address.state} ${address.pincode}`]
    .filter(Boolean)
    .join(", ");

  return apiSuccess({
    address: {
      id: address.id,
      type: address.type,
      name,
      fullName: address.fullName,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone,
      isDefault: address.isDefault,
      address: addressStr,
    },
  });
});

/**
 * DELETE /api/addresses/[id] — soft-delete an address (customer's own).
 */
export const DELETE = withApiHandler(async (request: NextRequest, context?: ApiRouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to delete the address.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can delete addresses.");

  const params = context ? await context.params : {};
  const id = typeof params.id === "string" ? params.id : undefined;
  if (!id?.trim()) return apiBadRequest("Address id is required.");

  const existing = await prisma.address.findFirst({
    where: { id, userId: session.sub, deletedAt: null },
  });
  if (!existing) return apiNotFound("Address not found.");

  await prisma.address.update({
    where: { id },
    data: { deletedAt: new Date(), updatedAt: new Date() },
  });

  return apiSuccess({ deleted: true });
});
