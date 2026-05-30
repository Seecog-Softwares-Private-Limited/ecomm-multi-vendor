/**
 * Customer login OTP — Quick SMS (no DLT). Uses plain text OTP message on Fast2SMS route `q`.
 */

import { sendSMS, type SendSmsResult } from "@/lib/sendSMS";
import { formatCustomerOtpQuickSms } from "@/lib/auth/otp.service";

export async function deliverCustomerLoginOtp(
  phoneNorm: string,
  plainOtp: string
): Promise<SendSmsResult> {
  return sendSMS(phoneNorm, formatCustomerOtpQuickSms(plainOtp));
}
