/**
 * Phase 4 — Customer ACCOUNT_INCOMPLETE gate tests.
 *
 * Run:
 *   npx tsx scripts/test-customer-auth-phase2.ts
 *   npx tsx scripts/test-customer-auth-phase3.ts
 *   npx tsx scripts/test-customer-auth-phase4.ts
 */

import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { prisma } from "../src/lib/prisma";
import { ApiRouteError } from "../src/lib/api";
import { signToken } from "../src/lib/auth/jwt";
import { assertCustomerAuthComplete } from "../src/lib/auth/assert-customer-auth-complete";
import {
  isAuthRequiredPath,
  isCustomerOnboardingPage,
  isAuthPage,
  CUSTOMER_ONBOARDING_PATH,
} from "../src/lib/auth/middleware-routes";
import { placeholderEmailForPhoneNorm } from "../src/lib/auth/phone";

const TAG = `p4-${Date.now().toString(36)}`;
const createdUserIds: string[] = [];

function section(title: string) {
  console.log(`\n== ${title} ==`);
}

function uniquePhone(suffix: number): string {
  const lead = String(6 + (suffix % 4));
  const r = Math.floor(Math.random() * 1e9)
    .toString()
    .padStart(9, "0");
  return `${lead}${r}`.slice(0, 10);
}

async function track<T extends { id: string }>(user: T): Promise<T> {
  createdUserIds.push(user.id);
  return user;
}

async function requestWithBearer(token: string | null): Promise<NextRequest> {
  const headers = new Headers();
  if (token) headers.set("authorization", `Bearer ${token}`);
  return new NextRequest("http://localhost/api/cart/items", {
    method: "GET",
    headers,
  });
}

async function cleanup() {
  if (createdUserIds.length === 0) return;
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}

async function main() {
  section("middleware route helpers — no redirect loops");
  assert.equal(isCustomerOnboardingPage("/complete-profile"), true);
  assert.equal(isAuthPage("/complete-profile"), true);
  assert.equal(isAuthPage("/verify-email"), true);
  assert.equal(isAuthRequiredPath("/cart"), true);
  assert.equal(isAuthRequiredPath("/complete-profile"), false);
  assert.equal(CUSTOMER_ONBOARDING_PATH, "/complete-profile");

  section("unauthenticated → 401");
  await assert.rejects(
    async () => assertCustomerAuthComplete(await requestWithBearer(null)),
    (e: unknown) =>
      e instanceof ApiRouteError &&
      e.status === 401 &&
      e.code === "UNAUTHORIZED"
  );

  section("incomplete customer → ACCOUNT_INCOMPLETE");
  const phone = uniquePhone(1);
  const incomplete = await track(
    await prisma.user.create({
      data: {
        email: placeholderEmailForPhoneNorm(`91${phone}`),
        passwordHash: null,
        phone: `91${phone}`,
        phoneVerified: true,
        emailVerified: false,
        authOnboardingComplete: false,
      },
    })
  );
  const incompleteToken = await signToken({
    sub: incomplete.id,
    email: incomplete.email,
    role: "CUSTOMER",
  });
  await assert.rejects(
    async () =>
      assertCustomerAuthComplete(await requestWithBearer(incompleteToken)),
    (e: unknown) =>
      e instanceof ApiRouteError &&
      e.status === 403 &&
      e.code === "ACCOUNT_INCOMPLETE" &&
      Boolean(
        e.details &&
          typeof e.details === "object" &&
          (e.details as { needsAuthOnboarding?: boolean }).needsAuthOnboarding ===
            true
      )
  );

  section("complete customer → allowed");
  const complete = await track(
    await prisma.user.create({
      data: {
        email: `${TAG}-complete@example.com`,
        passwordHash: "x",
        firstName: "Complete",
        lastName: "User",
        phone: `91${uniquePhone(2)}`,
        phoneVerified: true,
        emailVerified: true,
        authOnboardingComplete: true,
      },
    })
  );
  const completeToken = await signToken({
    sub: complete.id,
    email: complete.email,
    role: "CUSTOMER",
  });
  const session = await assertCustomerAuthComplete(
    await requestWithBearer(completeToken)
  );
  assert.equal(session.sub, complete.id);
  assert.equal(session.role, "CUSTOMER");

  section("wrong role (seller token shape) → FORBIDDEN");
  const sellerish = await signToken({
    sub: complete.id,
    email: complete.email,
    role: "SELLER",
  });
  await assert.rejects(
    async () => assertCustomerAuthComplete(await requestWithBearer(sellerish)),
    (e: unknown) =>
      e instanceof ApiRouteError && e.status === 403 && e.code === "FORBIDDEN"
  );

  section("stale JWT ignored — DB incomplete blocks even if token exists");
  // Token is valid CUSTOMER JWT; DB flag is false → still blocked
  await prisma.user.update({
    where: { id: complete.id },
    data: { authOnboardingComplete: false },
  });
  await assert.rejects(
    async () =>
      assertCustomerAuthComplete(await requestWithBearer(completeToken)),
    (e: unknown) =>
      e instanceof ApiRouteError && e.code === "ACCOUNT_INCOMPLETE"
  );
  // restore for cleanup consistency
  await prisma.user.update({
    where: { id: complete.id },
    data: { authOnboardingComplete: true },
  });

  console.log("\nAll Phase 4 gate checks passed.");
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
    await prisma.$disconnect();
  });
