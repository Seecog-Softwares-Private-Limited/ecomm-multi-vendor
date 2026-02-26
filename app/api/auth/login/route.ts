import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiBadRequest,
  apiUnauthorized,
  apiValidationError,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  validateLogin,
  formatValidationDetails,
  verifyPassword,
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

  const validation = validateLogin(body);
  if (!validation.success) {
    return apiValidationError("Validation failed", formatValidationDetails(validation.errors));
  }

  const { email, password } = validation.data;

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  });

  if (!user) {
    return apiUnauthorized("Invalid email or password");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return apiUnauthorized("Invalid email or password");
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: "CUSTOMER",
  });

  const response = apiSuccess({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: "CUSTOMER",
    },
  });

  setAuthCookie(response, token);
  return response;
});
