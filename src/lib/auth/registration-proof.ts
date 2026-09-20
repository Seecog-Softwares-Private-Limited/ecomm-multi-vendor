/**
 * Short-lived signed proofs issued after Customer registration OTP verify.
 * Register endpoint requires matching email + phone proofs (server-side only).
 */

import * as jose from "jose";
import { authConfig } from "./config";

const encoder = new TextEncoder();

export const REG_PROOF_EMAIL = "customer_reg_email";
export const REG_PROOF_PHONE = "customer_reg_phone";
export const REG_PROOF_VENDOR_PHONE = "vendor_reg_phone";

/** Proofs remain valid long enough to finish the registration form. */
export const REG_PROOF_EXPIRES = "30m";

type EmailProofPayload = {
  purpose: typeof REG_PROOF_EMAIL;
  email: string;
  otpId: string;
};

type PhoneProofPayload = {
  purpose: typeof REG_PROOF_PHONE;
  phone: string;
  otpId: string;
};

type VendorPhoneProofPayload = {
  purpose: typeof REG_PROOF_VENDOR_PHONE;
  phone: string;
  otpId: string;
};

function secretKey(): Uint8Array {
  if (!authConfig.jwtSecret || authConfig.jwtSecret.length === 0) {
    throw new Error("JWT_SECRET is not set; cannot sign registration proof");
  }
  return encoder.encode(authConfig.jwtSecret);
}

export async function signEmailRegistrationProof(
  email: string,
  otpId: string
): Promise<string> {
  return new jose.SignJWT({
    purpose: REG_PROOF_EMAIL,
    email: email.trim().toLowerCase(),
    otpId,
  } satisfies EmailProofPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REG_PROOF_EXPIRES)
    .sign(secretKey());
}

export async function signPhoneRegistrationProof(
  phoneNorm: string,
  otpId: string
): Promise<string> {
  return new jose.SignJWT({
    purpose: REG_PROOF_PHONE,
    phone: phoneNorm,
    otpId,
  } satisfies PhoneProofPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REG_PROOF_EXPIRES)
    .sign(secretKey());
}

export async function signVendorPhoneRegistrationProof(
  phoneNorm: string,
  otpId: string
): Promise<string> {
  return new jose.SignJWT({
    purpose: REG_PROOF_VENDOR_PHONE,
    phone: phoneNorm,
    otpId,
  } satisfies VendorPhoneProofPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REG_PROOF_EXPIRES)
    .sign(secretKey());
}

export async function verifyEmailRegistrationProof(
  token: string,
  expectedEmail: string
): Promise<{ ok: true; otpId: string } | { ok: false }> {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey());
    if (payload.purpose !== REG_PROOF_EMAIL) return { ok: false };
    if (typeof payload.email !== "string" || typeof payload.otpId !== "string") {
      return { ok: false };
    }
    if (payload.email.trim().toLowerCase() !== expectedEmail.trim().toLowerCase()) {
      return { ok: false };
    }
    return { ok: true, otpId: payload.otpId };
  } catch {
    return { ok: false };
  }
}

export async function verifyPhoneRegistrationProof(
  token: string,
  expectedPhoneNorm: string
): Promise<{ ok: true; otpId: string } | { ok: false }> {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey());
    if (payload.purpose !== REG_PROOF_PHONE) return { ok: false };
    if (typeof payload.phone !== "string" || typeof payload.otpId !== "string") {
      return { ok: false };
    }
    if (payload.phone !== expectedPhoneNorm) return { ok: false };
    return { ok: true, otpId: payload.otpId };
  } catch {
    return { ok: false };
  }
}

export async function verifyVendorPhoneRegistrationProof(
  token: string,
  expectedPhoneNorm: string
): Promise<{ ok: true; otpId: string } | { ok: false }> {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey());
    if (payload.purpose !== REG_PROOF_VENDOR_PHONE) return { ok: false };
    if (typeof payload.phone !== "string" || typeof payload.otpId !== "string") {
      return { ok: false };
    }
    if (payload.phone !== expectedPhoneNorm) return { ok: false };
    return { ok: true, otpId: payload.otpId };
  } catch {
    return { ok: false };
  }
}
