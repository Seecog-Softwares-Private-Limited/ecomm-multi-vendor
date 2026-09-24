/**
 * Customer App phone-at-order gate — focused unit + optional DB checks.
 *
 * Run: npx tsx scripts/test-customer-app-phone-gate.ts
 */

import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  computeAuthOnboardingComplete,
  computeCustomerAppAuthReady,
  customerHasVerifiedPhone,
} from "../src/lib/auth/customer-onboarding";
import {
  CUSTOMER_APP_COOKIE_NAME,
  CUSTOMER_APP_COOKIE_VALUE,
  isCustomerAppRequest,
} from "../src/lib/auth/customer-app-cookie";
import { resolveCustomerOnboardingStep } from "../src/lib/auth/customer-onboarding-client";
import { ApiRouteError } from "../src/lib/api";
import { signToken } from "../src/lib/auth/jwt";
import { assertCustomerAuthComplete } from "../src/lib/auth/assert-customer-auth-complete";
import { prisma } from "../src/lib/prisma";

const TAG = `capp-${Date.now().toString(36)}`;
const createdUserIds: string[] = [];

function section(title: string) {
  console.log(`\n== ${title} ==`);
}

function requestWith(
  opts: { bearer?: string | null; customerAppCookie?: boolean } = {}
): NextRequest {
  const headers = new Headers();
  if (opts.bearer) headers.set("authorization", `Bearer ${opts.bearer}`);
  if (opts.customerAppCookie) {
    headers.set(
      "cookie",
      `${CUSTOMER_APP_COOKIE_NAME}=${CUSTOMER_APP_COOKIE_VALUE}`
    );
  }
  return new NextRequest("http://localhost/api/orders", {
    method: "POST",
    headers,
  });
}

/** Mirrors POST /api/orders phone gate (App cookie + verified phone). */
function wouldRejectOrderForPhone(opts: {
  isApp: boolean;
  phone: string | null;
  phoneVerified: boolean;
}): boolean {
  return (
    opts.isApp &&
    !customerHasVerifiedPhone({
      phone: opts.phone,
      phoneVerified: opts.phoneVerified,
    })
  );
}

async function track<T extends { id: string }>(user: T): Promise<T> {
  createdUserIds.push(user.id);
  return user;
}

async function cleanup() {
  if (createdUserIds.length === 0) return;
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}

function runUnitChecks() {
  section("strict onboarding still requires phone (Website)");
  assert.equal(
    computeAuthOnboardingComplete({
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
      emailVerified: true,
      phone: null,
      phoneVerified: false,
    }),
    false
  );
  assert.equal(
    computeAuthOnboardingComplete({
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
      emailVerified: true,
      phone: "919876543210",
      phoneVerified: true,
    }),
    true
  );

  section("App soft ready — phone optional");
  assert.equal(
    computeCustomerAppAuthReady({
      firstName: "A",
      lastName: null,
      email: "a@b.com",
      emailVerified: true,
    }),
    true
  );
  assert.equal(
    computeCustomerAppAuthReady({
      firstName: "A",
      lastName: null,
      email: "a@b.com",
      emailVerified: false,
    }),
    false
  );

  section("verified phone helper");
  assert.equal(
    customerHasVerifiedPhone({ phone: null, phoneVerified: false }),
    false
  );
  assert.equal(
    customerHasVerifiedPhone({ phone: "9198", phoneVerified: false }),
    false
  );
  assert.equal(
    customerHasVerifiedPhone({ phone: "919876543210", phoneVerified: true }),
    true
  );

  section("isCustomerAppRequest — cookie only");
  assert.equal(isCustomerAppRequest(requestWith({})), false);
  assert.equal(
    isCustomerAppRequest(requestWith({ customerAppCookie: true })),
    true
  );

  section("order phone gate matrix");
  assert.equal(
    wouldRejectOrderForPhone({
      isApp: true,
      phone: null,
      phoneVerified: false,
    }),
    true
  );
  assert.equal(
    wouldRejectOrderForPhone({
      isApp: true,
      phone: "919876543210",
      phoneVerified: true,
    }),
    false
  );
  assert.equal(
    wouldRejectOrderForPhone({
      isApp: false,
      phone: null,
      phoneVerified: false,
    }),
    false,
    "Website does not use this App-only gate (strict onboarding already applied)"
  );

  section("onboarding client — skip phone on App");
  assert.equal(
    resolveCustomerOnboardingStep(
      {
        authOnboardingComplete: false,
        needsAuthOnboarding: true,
        phoneVerified: false,
        phone: null,
        email: "a@b.com",
        emailVerified: true,
        firstName: "A",
      },
      { skipPhoneStep: true }
    ),
    "done"
  );
  assert.equal(
    resolveCustomerOnboardingStep({
      authOnboardingComplete: false,
      needsAuthOnboarding: true,
      phoneVerified: false,
      phone: null,
      email: "a@b.com",
      emailVerified: true,
      firstName: "A",
    }),
    "phone_otp",
    "Website / default still starts at phone OTP"
  );

  console.log("\nUnit checks passed.");
}

async function runDbChecks() {
  section("DB: unauthenticated + App cookie → still 401");
  await assert.rejects(
    async () =>
      assertCustomerAuthComplete(
        requestWith({ customerAppCookie: true, bearer: null })
      ),
    (e: unknown) =>
      e instanceof ApiRouteError &&
      e.status === 401 &&
      e.code === "UNAUTHORIZED"
  );

  section("DB: Website incomplete (email+name, no phone) → ACCOUNT_INCOMPLETE");
  const websiteIncomplete = await track(
    await prisma.user.create({
      data: {
        email: `${TAG}-web@example.com`,
        passwordHash: "x",
        firstName: "Web",
        lastName: "User",
        phone: null,
        phoneVerified: false,
        emailVerified: true,
        authOnboardingComplete: false,
      },
    })
  );
  const webToken = await signToken({
    sub: websiteIncomplete.id,
    email: websiteIncomplete.email,
    role: "CUSTOMER",
  });
  await assert.rejects(
    async () =>
      assertCustomerAuthComplete(requestWith({ bearer: webToken })),
    (e: unknown) =>
      e instanceof ApiRouteError && e.code === "ACCOUNT_INCOMPLETE"
  );

  section("DB: App cookie + soft-ready (no phone) → allowed");
  const appSoft = await track(
    await prisma.user.create({
      data: {
        email: `${TAG}-app@example.com`,
        passwordHash: "x",
        firstName: "App",
        lastName: "User",
        phone: null,
        phoneVerified: false,
        emailVerified: true,
        authOnboardingComplete: false,
      },
    })
  );
  const appToken = await signToken({
    sub: appSoft.id,
    email: appSoft.email,
    role: "CUSTOMER",
  });
  const softSession = await assertCustomerAuthComplete(
    requestWith({ bearer: appToken, customerAppCookie: true })
  );
  assert.equal(softSession.sub, appSoft.id);
  assert.equal(
    wouldRejectOrderForPhone({
      isApp: true,
      phone: appSoft.phone,
      phoneVerified: appSoft.phoneVerified,
    }),
    true,
    "PHONE_REQUIRED_FOR_ORDER equivalent"
  );

  section("DB: App cookie + verified phone → soft gate OK + order phone OK");
  const appPhone = await track(
    await prisma.user.create({
      data: {
        email: `${TAG}-appphone@example.com`,
        passwordHash: "x",
        firstName: "App",
        lastName: "Phone",
        phone: `91${String(6000000000 + (Date.now() % 1000000000)).slice(0, 10)}`,
        phoneVerified: true,
        emailVerified: true,
        authOnboardingComplete: true,
      },
    })
  );
  const appPhoneToken = await signToken({
    sub: appPhone.id,
    email: appPhone.email,
    role: "CUSTOMER",
  });
  const phoneSession = await assertCustomerAuthComplete(
    requestWith({ bearer: appPhoneToken, customerAppCookie: true })
  );
  assert.equal(phoneSession.sub, appPhone.id);
  assert.equal(
    wouldRejectOrderForPhone({
      isApp: true,
      phone: appPhone.phone,
      phoneVerified: appPhone.phoneVerified,
    }),
    false
  );

  console.log("\nDB checks passed.");
}

async function main() {
  runUnitChecks();

  try {
    await runDbChecks();
  } catch (e) {
    console.error("\nDB checks failed (is DATABASE_URL configured?):", e);
    process.exitCode = 1;
    return;
  }

  console.log("\nAll Customer App phone-gate checks passed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await cleanup();
    } catch (e) {
      console.error("cleanup failed", e);
    }
    await prisma.$disconnect().catch(() => undefined);
  });
