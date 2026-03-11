import crypto from "crypto";
import Razorpay from "razorpay";

let instance: Razorpay | null = null;

/**
 * Get Razorpay instance. Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in env.
 */
export function getRazorpay(): Razorpay {
  if (!instance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set");
    }
    instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return instance;
}

/**
 * Verify Razorpay payment signature (order_id|payment_id signed with key_secret).
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}
