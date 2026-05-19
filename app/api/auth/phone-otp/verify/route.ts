import { NextRequest } from "next/server";
import { withApiHandler, apiBadRequest } from "@/lib/api";
import { handleVerifyCustomerOtp } from "@/lib/auth/auth.controller";

/**
 * POST /api/auth/phone-otp/verify
 * Alias: POST /api/auth/verify-otp
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  return handleVerifyCustomerOtp(body);
});
