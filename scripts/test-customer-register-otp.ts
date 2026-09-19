/**
 * Customer registration email+phone OTP smoke tests (no Vendor).
 * Requires: DB migrated, OTP_DEV_CONSOLE=true for phone without SMS, SMTP optional.
 *
 * Run: npx tsx scripts/test-customer-register-otp.ts
 */
import { createHmac, randomInt } from "crypto";
import { PrismaClient } from "@prisma/client";
import {
  hashEmailOtp,
  verifyEmailOtpHash,
} from "../src/lib/auth/email-otp-hash";
import {
  signEmailRegistrationProof,
  signPhoneRegistrationProof,
  verifyEmailRegistrationProof,
  verifyPhoneRegistrationProof,
} from "../src/lib/auth/registration-proof";
import {
  generateOtpCode,
  isSixDigitOtp,
} from "../src/lib/auth/otp.service";
import { hashPhoneOtp, verifyPhoneOtp } from "../src/lib/auth/phone-otp-hash";

const prisma = new PrismaClient();
let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${msg}`);
  } else {
    failed++;
    console.error(`  FAIL  ${msg}`);
  }
}

async function main() {
  console.log("\n=== Email OTP hash ===");
  const email = `otp-test-${Date.now()}@example.com`;
  const code = generateOtpCode();
  assert(isSixDigitOtp(code), "generateOtpCode is 6 digits");
  const h = hashEmailOtp(email, code);
  assert(verifyEmailOtpHash(email, code, h), "email OTP hash verifies");
  assert(!verifyEmailOtpHash(email, "000000", h), "wrong email OTP rejected");
  assert(!verifyEmailOtpHash("other@example.com", code, h), "different email rejected");

  console.log("\n=== Phone OTP hash (existing) ===");
  const phone = "919876543210";
  const pCode = String(randomInt(100000, 1000000));
  const ph = hashPhoneOtp(phone, pCode);
  assert(verifyPhoneOtp(phone, pCode, ph), "phone OTP hash verifies");
  assert(!verifyPhoneOtp(phone, "111111", ph), "wrong phone OTP rejected");

  console.log("\n=== Registration proofs ===");
  const emailToken = await signEmailRegistrationProof(email, "otp-row-1");
  const phoneToken = await signPhoneRegistrationProof(phone, "otp-row-2");
  const ev = await verifyEmailRegistrationProof(emailToken, email);
  const pv = await verifyPhoneRegistrationProof(phoneToken, phone);
  assert(ev.ok && ev.otpId === "otp-row-1", "email proof verifies for matching email");
  assert(pv.ok && pv.otpId === "otp-row-2", "phone proof verifies for matching phone");
  const badE = await verifyEmailRegistrationProof(emailToken, "other@example.com");
  const badP = await verifyPhoneRegistrationProof(phoneToken, "919999999999");
  assert(!badE.ok, "email proof rejects other email");
  assert(!badP.ok, "phone proof rejects other phone");
  const swapped = await verifyEmailRegistrationProof(phoneToken, email);
  assert(!swapped.ok, "phone proof cannot verify as email proof");

  console.log("\n=== CustomerEmailOtp table round-trip ===");
  const row = await prisma.customerEmailOtp.create({
    data: {
      id: crypto.randomUUID(),
      emailNorm: email,
      codeHash: h,
      expiresAt: new Date(Date.now() + 5 * 60_000),
      attemptCount: 0,
    },
  });
  assert(Boolean(row.id), "email OTP row created");
  await prisma.customerEmailOtp.update({
    where: { id: row.id },
    data: { consumedAt: new Date() },
  });
  const active = await prisma.customerEmailOtp.findFirst({
    where: { emailNorm: email, consumedAt: null, expiresAt: { gt: new Date() } },
  });
  assert(active === null, "consumed OTP not active");
  await prisma.customerEmailOtp.deleteMany({ where: { emailNorm: email } });

  console.log("\n=== HMAC secret sanity ===");
  assert(typeof createHmac === "function", "crypto HMAC available");

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
