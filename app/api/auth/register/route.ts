import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiConflict,
  apiValidationError,
  Status,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  validateRegister,
  formatValidationDetails,
  hashPassword,
  signToken,
  setAuthCookie,
} from "@/lib/auth";
export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const validation = validateRegister(body);
  if (!validation.success) {
    return apiValidationError("Validation failed", formatValidationDetails(validation.errors));
  }

  const { email, password, firstName, lastName, phone } = validation.data;

  const existing = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true },
  });
  if (existing) {
    return apiConflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      phone: phone ?? null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
  });

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  const response = apiSuccess(
    {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: "CUSTOMER",
      },
    },
    Status.CREATED
  );

  setAuthCookie(response, token);
  return response;
});
