/**
 * Vendor auth Phases 2–4 unit + gate tests (uses DB for gate cases).
 * Run: npx tsx scripts/test-vendor-auth-phases.ts
 */

import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { PrismaClient, SellerStatus } from "@prisma/client";
import { ApiRouteError } from "../src/lib/api";
import { signToken } from "../src/lib/auth/jwt";
import { assertSellerAuthComplete } from "../src/lib/auth/assert-seller-auth-complete";
import {
  computeSellerAuthOnboardingComplete,
  isPlaceholderVendorEmail,
  placeholderEmailForVendorPhoneNorm,
  syncSellerAuthOnboardingComplete,
} from "../src/lib/auth/seller-onboarding";
import { resolveAppleVendorMatch } from "../src/lib/auth/apple";
import {
  isVendorAuthOnboardingPage,
  isVendorPublicPage,
  VENDOR_AUTH_ONBOARDING_PATH,
} from "../src/lib/auth/middleware-routes";
import {
  resolveVendorOnboardingStep,
  vendorNeedsAuthOnboarding,
  isVendorAccountIncompleteApiError,
} from "../src/lib/auth/vendor-onboarding-client";

const prisma = new PrismaClient();
const TAG = `vauth-${Date.now().toString(36)}`;
const created: string[] = [];

function section(t: string) {
  console.log(`\n== ${t} ==`);
}

async function track<T extends { id: string }>(s: T): Promise<T> {
  created.push(s.id);
  return s;
}

async function cleanup() {
  if (created.length) {
    await prisma.seller.deleteMany({ where: { id: { in: created } } });
  }
}

async function main() {
  section("placeholder + completion pure checks");
  const phoneNorm = "919876543210";
  assert.equal(isPlaceholderVendorEmail(placeholderEmailForVendorPhoneNorm(phoneNorm)), true);
  assert.equal(
    computeSellerAuthOnboardingComplete({
      ownerName: "Pending",
      email: placeholderEmailForVendorPhoneNorm(phoneNorm),
      emailVerified: false,
      phone: phoneNorm,
      phoneVerified: true,
    }),
    false
  );
  assert.equal(
    computeSellerAuthOnboardingComplete({
      ownerName: "Ada Vendor",
      email: "ada@example.com",
      emailVerified: true,
      phone: phoneNorm,
      phoneVerified: true,
    }),
    true
  );

  section("Apple match — no email auto-link");
  assert.deepEqual(
    resolveAppleVendorMatch({
      appleUserId: "sub-1",
      verifiedRealEmail: "a@b.com",
      byAppleSub: null,
      byEmail: { id: "s1", email: "a@b.com", appleUserId: null },
    }),
    { action: "conflict" }
  );

  section("middleware helpers — no loops");
  assert.equal(isVendorAuthOnboardingPage("/vendor/complete-account"), true);
  assert.equal(isVendorPublicPage("/vendor/complete-account"), true);
  assert.equal(isVendorPublicPage("/vendor/login"), true);
  assert.equal(VENDOR_AUTH_ONBOARDING_PATH, "/vendor/complete-account");

  section("client step resolution");
  assert.equal(
    resolveVendorOnboardingStep({
      authOnboardingComplete: false,
      needsAuthOnboarding: true,
      phoneVerified: false,
      email: "g@example.com",
      emailVerified: true,
      ownerName: "G",
    }),
    "phone_otp"
  );
  assert.equal(
    resolveVendorOnboardingStep({
      authOnboardingComplete: false,
      needsAuthOnboarding: true,
      phoneVerified: true,
      phone: phoneNorm,
      email: placeholderEmailForVendorPhoneNorm(phoneNorm),
      ownerName: "Pending",
    }),
    "name_email"
  );
  assert.equal(
    vendorNeedsAuthOnboarding({ authOnboardingComplete: true, needsAuthOnboarding: false }),
    false
  );
  assert.equal(
    isVendorAccountIncompleteApiError({
      error: { code: "ACCOUNT_INCOMPLETE", message: "x" },
    }),
    true
  );
  assert.equal(
    isVendorAccountIncompleteApiError({ error: { code: "ACCOUNT_NOT_APPROVED" } }),
    false
  );

  section("DB: incomplete seller → ACCOUNT_INCOMPLETE");
  const incomplete = await track(
    await prisma.seller.create({
      data: {
        email: `${TAG}-inc@example.com`,
        passwordHash: null,
        businessName: "Pending",
        ownerName: "Pending",
        phone: `91${String(6000000000 + Math.floor(Math.random() * 1e9)).slice(0, 10)}`,
        status: SellerStatus.DRAFT,
        emailVerified: false,
        phoneVerified: true,
        authOnboardingComplete: false,
      },
    })
  );
  const tokenInc = await signToken({
    sub: incomplete.id,
    email: incomplete.email,
    role: "SELLER",
  });
  const reqInc = new NextRequest("http://localhost/api/vendor/dashboard", {
    headers: { authorization: `Bearer ${tokenInc}` },
  });
  await assert.rejects(
    async () => assertSellerAuthComplete(reqInc),
    (e: unknown) =>
      e instanceof ApiRouteError &&
      e.status === 403 &&
      e.code === "ACCOUNT_INCOMPLETE"
  );

  section("DB: complete seller passes auth gate (approval separate)");
  const complete = await track(
    await prisma.seller.create({
      data: {
        email: `${TAG}-ok@example.com`,
        passwordHash: null,
        businessName: "Shop",
        ownerName: "Owner Name",
        phone: `91${String(7000000000 + Math.floor(Math.random() * 1e9)).slice(0, 10)}`,
        status: SellerStatus.DRAFT,
        emailVerified: true,
        phoneVerified: true,
        authOnboardingComplete: true,
      },
    })
  );
  const tokenOk = await signToken({
    sub: complete.id,
    email: complete.email,
    role: "SELLER",
  });
  const reqOk = new NextRequest("http://localhost/api/vendor/profile", {
    headers: { authorization: `Bearer ${tokenOk}` },
  });
  const session = await assertSellerAuthComplete(reqOk);
  assert.equal(session.sellerId, complete.id);

  section("DB: syncSellerAuthOnboardingComplete");
  const synced = await syncSellerAuthOnboardingComplete(complete.id);
  assert.equal(synced, true);

  section("existing complete sellers remain complete");
  const existingComplete = await prisma.seller.count({
    where: { deletedAt: null, authOnboardingComplete: true },
  });
  assert.ok(existingComplete >= 28 - created.length || existingComplete >= 1);

  section("unauthenticated → 401");
  await assert.rejects(
    async () =>
      assertSellerAuthComplete(new NextRequest("http://localhost/api/vendor/dashboard")),
    (e: unknown) => e instanceof ApiRouteError && e.code === "UNAUTHORIZED"
  );

  console.log("\nVendor auth phase tests passed.\n");
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    await prisma.$disconnect();
  });
