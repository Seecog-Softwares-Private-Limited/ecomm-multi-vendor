/**
 * Customer login OTP delivery via BlackSMS OTP API.
 * App still generates and stores the OTP; BlackSMS only sends `variables_values`.
 */

import { toIndianMobile10Digits } from "@/lib/auth/phone";
import { sendBlackSmsOtp, type BlackSmsResult } from "@/sms/blacksms.client";

export async function deliverCustomerLoginOtp(
  phoneNorm: string,
  plainOtp: string
): Promise<BlackSmsResult> {
  const mobile10 = toIndianMobile10Digits(phoneNorm);
  return sendBlackSmsOtp(mobile10, plainOtp);
}
