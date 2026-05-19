import { NextRequest } from "next/server";
import { withApiHandler, apiBadRequest } from "@/lib/api";
import { handleSendCustomerOtp } from "@/lib/auth/auth.controller";

/**
 * POST /api/auth/phone-otp/send
 * Alias: POST /api/auth/send-otp
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  return handleSendCustomerOtp(body);
});
