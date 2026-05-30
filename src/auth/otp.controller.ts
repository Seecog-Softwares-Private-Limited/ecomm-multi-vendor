/**
 * OTP HTTP handlers — POST /api/auth/send-otp and POST /api/auth/verify-otp.
 * Delegates to existing auth.controller (DB OTP, 5 min expiry). SMS uses Fast2SMS via otp-delivery.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  handleSendCustomerOtp,
  handleVerifyCustomerOtp,
} from "@/lib/auth/auth.controller";
import { apiBadRequest, withApiHandler } from "@/lib/api";

/** POST /api/auth/send-otp — body: { phone, resend? } */
export async function sendOtpController(body: unknown): Promise<NextResponse> {
  return handleSendCustomerOtp(body);
}

/** POST /api/auth/verify-otp — body: { phone, otp | code } */
export async function verifyOtpController(body: unknown): Promise<NextResponse> {
  return handleVerifyCustomerOtp(body);
}

export const POST_SEND_OTP = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  return sendOtpController(body);
});

export const POST_VERIFY_OTP = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }
  return verifyOtpController(body);
});
