import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiBadRequest,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { completeProfileDetails } from "@/lib/profile/complete-details";

/**
 * POST /api/profile/complete-details
 * Saves the required mobile number and optional name fields after login.
 * Body: { phone: string, firstName?: string, lastName?: string, skipOptional?: boolean }
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Not authenticated");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customer accounts use this step.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  if (typeof body !== "object" || body === null) return apiBadRequest("Body must be an object.");

  const b = body as Record<string, unknown>;
  const phone = typeof b.phone === "string" ? b.phone : "";
  if (!phone.trim()) return apiBadRequest("Mobile number is required.");

  const firstName = typeof b.firstName === "string" ? b.firstName : undefined;
  const lastName = typeof b.lastName === "string" ? b.lastName : undefined;
  const skipOptional = b.skipOptional === true;

  const { error } = await completeProfileDetails(session.sub, {
    phone,
    firstName,
    lastName,
    skipOptional,
  });
  if (error) return apiBadRequest(error);

  return apiSuccess({ message: "Profile saved", profileCompleted: true });
});
