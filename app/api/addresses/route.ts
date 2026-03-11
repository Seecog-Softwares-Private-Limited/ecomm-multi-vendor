import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressType } from "@prisma/client";

/**
 * GET /api/addresses — list current user's addresses (customer).
 * Requires customer session.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to view addresses.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers have addresses.");

  const addresses = await prisma.address.findMany({
    where: { userId: session.sub, deletedAt: null },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
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

  const list = addresses.map((a) => ({
    id: a.id,
    type: a.type,
    name: a.type === "HOME" ? "Home" : a.type === "OFFICE" ? "Office" : "Other",
    fullName: a.fullName,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    phone: a.phone,
    isDefault: a.isDefault,
    address: [a.line1, a.line2, `${a.city}, ${a.state} ${a.pincode}`].filter(Boolean).join(", "),
  }));

  return apiSuccess({ addresses: list });
});

/**
 * POST /api/addresses — create a new address for the current user (customer).
 * Body: { fullName, phone, line1, line2?, city, state, pincode, type?: "HOME"|"OFFICE"|"OTHER", isDefault?: boolean }
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in to add an address.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can add addresses.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) return apiBadRequest("Body must be an object.");

  const b = body as Record<string, unknown>;
  const fullName = typeof b.fullName === "string" ? b.fullName.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  const line1 = typeof b.line1 === "string" ? b.line1.trim() : "";
  const line2 = typeof b.line2 === "string" ? b.line2.trim() || null : null;
  const city = typeof b.city === "string" ? b.city.trim() : "";
  const state = typeof b.state === "string" ? b.state.trim() : "";
  const pincode = typeof b.pincode === "string" ? b.pincode.trim() : "";
  const typeStr = typeof b.type === "string" ? b.type.toUpperCase() : "HOME";
  const type: AddressType =
    typeStr === "OFFICE" ? "OFFICE" : typeStr === "OTHER" ? "OTHER" : "HOME";
  const isDefault = b.isDefault === true;

  if (!fullName) return apiBadRequest("fullName is required.");
  if (!phone) return apiBadRequest("phone is required.");
  if (!line1) return apiBadRequest("line1 is required.");
  if (!city) return apiBadRequest("city is required.");
  if (!state) return apiBadRequest("state is required.");
  if (!pincode) return apiBadRequest("pincode is required.");

  const user = await prisma.user.findUnique({
    where: { id: session.sub, deletedAt: null },
    select: { id: true },
  });
  if (!user) return apiUnauthorized("User not found.");

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      type,
      fullName,
      line1,
      line2,
      city,
      state,
      pincode,
      phone,
      isDefault: isDefault || false,
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
