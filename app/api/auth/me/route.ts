import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiUnauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/me — return current user from HTTP-only cookie (token verification).
 * Use getSession(request) to verify JWT and get role-based claims.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) {
    return apiUnauthorized("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt) {
    return apiUnauthorized("User not found");
  }

  const { deletedAt: _, ...safeUser } = user;
  return apiSuccess({
    user: {
      ...safeUser,
      role: session.role,
    },
  });
});
