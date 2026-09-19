/**
 * Phase 3 customer onboarding tests (helpers + DB integration).
 *
 * Run:
 *   npx tsx scripts/test-customer-auth-phase2.ts
 *   npx tsx scripts/test-customer-auth-phase3.ts
 */

import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "crypto";
import { prisma } from "../src/lib/prisma";
import {
  computeAuthOnboardingComplete,
  syncCustomerAuthOnboardingComplete,
  customerHasRealEmail,
  validateRegister,
  validateCustomerOnboardingProfile,
  placeholderEmailForPhoneNorm,
  isPlaceholderCustomerEmail,
} from "../src/lib/auth";
import {
  completePhoneFirstOnboarding,
  EMAIL_ALREADY_REGISTERED_MESSAGE,
} from "../src/lib/auth/complete-phone-onboarding";
import { completeProfileDetails } from "../src/lib/profile/complete-details";

const TAG = `p3-${Date.now().toString(36)}`;
const createdUserIds: string[] = [];

function section(title: string) {
  console.log(`\n== ${title} ==`);
}

function uniquePhone(suffix: number): string {
  // Valid 10-digit Indian mobile (starts with 6–9); unique per call.
  const lead = String(6 + (suffix % 4)); // 6–9
  const r = Math.floor(Math.random() * 1e9)
    .toString()
    .padStart(9, "0");
  return `${lead}${r}`.slice(0, 10);
}

function phoneNorm(ten: string): string {
  return `91${ten}`;
}

async function cleanup() {
  if (createdUserIds.length === 0) return;
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}

async function track<T extends { id: string }>(user: T): Promise<T> {
  createdUserIds.push(user.id);
  return user;
}

async function main() {
  section("validation — onboarding profile");
  assert.equal(
    validateCustomerOnboardingProfile({ email: "bad", name: "Ada" }).success,
    false
  );
  assert.equal(
    validateCustomerOnboardingProfile({ email: "ada@example.com" }).success,
    false,
    "name required"
  );
  const okProfile = validateCustomerOnboardingProfile({
    email: "Ada@Example.com",
    name: "Ada Lovelace",
  });
  assert.equal(okProfile.success, true);
  if (okProfile.success) {
    assert.equal(okProfile.data.email, "ada@example.com");
    assert.equal(okProfile.data.firstName, "Ada");
    assert.equal(okProfile.data.lastName, "Lovelace");
  }

  section("validation — normal register");
  assert.equal(
    validateRegister({
      email: "a@example.com",
      password: "Password1",
      firstName: "A",
    }).success,
    false,
    "phone required"
  );
  assert.equal(
    validateRegister({
      email: "a@example.com",
      password: "Password1",
      phone: "9876543210",
    }).success,
    false,
    "name required"
  );

  section("phone-first — create incomplete user (simulates OTP)");
  const phoneA = uniquePhone(1);
  const normA = phoneNorm(phoneA);
  const placeholder = placeholderEmailForPhoneNorm(normA);
  const phoneFirst = await track(
    await prisma.user.create({
      data: {
        email: placeholder,
        passwordHash: null,
        phone: normA,
        phoneVerified: true,
        emailVerified: false,
        profileCompleted: false,
        authOnboardingComplete: false,
      },
    })
  );
  assert.equal(phoneFirst.passwordHash, null);
  assert.equal(phoneFirst.phoneVerified, true);
  assert.equal(phoneFirst.emailVerified, false);
  assert.equal(isPlaceholderCustomerEmail(phoneFirst.email), true);
  assert.equal(customerHasRealEmail(phoneFirst.email), false);
  assert.equal(
    computeAuthOnboardingComplete({
      firstName: phoneFirst.firstName,
      lastName: phoneFirst.lastName,
      email: phoneFirst.email,
      emailVerified: phoneFirst.emailVerified,
      phone: phoneFirst.phone,
      phoneVerified: phoneFirst.phoneVerified,
    }),
    false
  );

  section("phone-first — reject missing name / invalid via service");
  const missingName = await completePhoneFirstOnboarding(phoneFirst.id, {
    firstName: null,
    lastName: null,
    email: `${TAG}-real@example.com`,
  });
  assert.equal(missingName.ok, false);

  section("phone-first — email conflict");
  const conflictOwner = await track(
    await prisma.user.create({
      data: {
        email: `${TAG}-taken@example.com`,
        passwordHash: "x",
        firstName: "Taken",
        emailVerified: true,
        phoneVerified: false,
        authOnboardingComplete: false,
      },
    })
  );
  const conflict = await completePhoneFirstOnboarding(phoneFirst.id, {
    firstName: "Phone",
    lastName: "User",
    email: `${TAG}-taken@example.com`,
  });
  assert.equal(conflict.ok, false);
  if (!conflict.ok) {
    assert.equal(conflict.kind, "email_conflict");
    assert.equal(conflict.message, EMAIL_ALREADY_REGISTERED_MESSAGE);
  }
  const unchanged = await prisma.user.findUnique({ where: { id: phoneFirst.id } });
  assert.equal(unchanged?.email, placeholder, "placeholder must remain on conflict");

  section("phone-first — name + real email replaces placeholder");
  const realEmail = `${TAG}-phonefirst@example.com`;
  const onboarded = await completePhoneFirstOnboarding(phoneFirst.id, {
    firstName: "Phone",
    lastName: "User",
    email: realEmail,
  });
  assert.equal(onboarded.ok, true);
  if (onboarded.ok) {
    assert.equal(onboarded.needsEmailVerification, true);
    assert.equal(onboarded.user.email, realEmail);
    assert.equal(onboarded.user.emailVerified, false);
    assert.equal(onboarded.user.authOnboardingComplete, false);
    assert.equal(onboarded.user.phoneVerified, true);
    assert.equal(isPlaceholderCustomerEmail(onboarded.user.email), false);
  }
  const afterEmail = await prisma.user.findUnique({ where: { id: phoneFirst.id } });
  assert.equal(afterEmail?.passwordHash, null);
  assert.equal(afterEmail?.emailVerified, false);
  assert.ok(afterEmail?.verificationToken);

  section("phone-first — email verification completes onboarding");
  await prisma.user.update({
    where: { id: phoneFirst.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });
  const complete = await syncCustomerAuthOnboardingComplete(phoneFirst.id);
  assert.equal(complete, true);
  const done = await prisma.user.findUnique({ where: { id: phoneFirst.id } });
  assert.equal(done?.authOnboardingComplete, true);

  section("google-first — incomplete until phone OTP");
  const google = await track(
    await prisma.user.create({
      data: {
        email: `${TAG}-google@example.com`,
        passwordHash: null,
        firstName: "Gita",
        lastName: "Google",
        emailVerified: true,
        phoneVerified: false,
        profileCompleted: false,
        authOnboardingComplete: false,
        oauthProvider: "google",
        oauthProviderId: `google-sub-${TAG}`,
      },
    })
  );
  assert.equal(await syncCustomerAuthOnboardingComplete(google.id), false);

  const phoneB = uniquePhone(2);
  const normB = phoneNorm(phoneB);
  // Simulate OTP attach (Phase 2/3 controller behavior)
  await prisma.user.update({
    where: { id: google.id },
    data: {
      phone: normB,
      phoneVerified: true,
      profileCompleted: true,
    },
  });
  assert.equal(await syncCustomerAuthOnboardingComplete(google.id), true);
  const googleDone = await prisma.user.findUnique({ where: { id: google.id } });
  assert.equal(googleDone?.passwordHash, null);
  assert.equal(googleDone?.oauthProviderId, `google-sub-${TAG}`);
  assert.equal(googleDone?.authOnboardingComplete, true);

  section("google — complete-details must NOT mark phone verified");
  const google2 = await track(
    await prisma.user.create({
      data: {
        email: `${TAG}-google2@example.com`,
        passwordHash: null,
        firstName: "G2",
        emailVerified: true,
        phoneVerified: false,
        authOnboardingComplete: false,
        oauthProvider: "google",
        oauthProviderId: `google-sub-2-${TAG}`,
      },
    })
  );
  const phoneC = uniquePhone(3);
  const formSave = await completeProfileDetails(google2.id, {
    phone: phoneC,
    firstName: "G2",
  });
  assert.equal(formSave.error, null);
  const g2 = await prisma.user.findUnique({ where: { id: google2.id } });
  assert.equal(g2?.phoneVerified, false);
  assert.equal(g2?.authOnboardingComplete, false);

  section("verified phone cannot be replaced via complete-details");
  const blocked = await completeProfileDetails(phoneFirst.id, {
    phone: uniquePhone(4),
  });
  assert.ok(blocked.error);
  assert.match(blocked.error!, /verified phone/i);

  section("normal registration completeness path");
  const phoneD = uniquePhone(5);
  const normD = phoneNorm(phoneD);
  const pwdUser = await track(
    await prisma.user.create({
      data: {
        email: `${TAG}-pwd@example.com`,
        passwordHash: "hashed",
        firstName: "Pat",
        lastName: "Word",
        phone: normD,
        phoneVerified: false,
        emailVerified: false,
        authOnboardingComplete: false,
      },
    })
  );
  assert.equal(await syncCustomerAuthOnboardingComplete(pwdUser.id), false);
  await prisma.user.update({
    where: { id: pwdUser.id },
    data: { emailVerified: true },
  });
  assert.equal(await syncCustomerAuthOnboardingComplete(pwdUser.id), false);
  await prisma.user.update({
    where: { id: pwdUser.id },
    data: { phoneVerified: true },
  });
  assert.equal(await syncCustomerAuthOnboardingComplete(pwdUser.id), true);

  section("security — onboarding only updates session user id");
  const phoneOther = uniquePhone(6);
  const other = await track(
    await prisma.user.create({
      data: {
        email: placeholderEmailForPhoneNorm(phoneNorm(phoneOther)),
        passwordHash: null,
        phone: phoneNorm(phoneOther),
        phoneVerified: true,
        emailVerified: false,
        authOnboardingComplete: false,
      },
    })
  );
  const beforeOther = await prisma.user.findUnique({ where: { id: other.id } });
  await completePhoneFirstOnboarding(phoneFirst.id, {
    firstName: "Phone",
    lastName: "User",
    email: `${TAG}-phonefirst-again@example.com`,
  });
  const afterOther = await prisma.user.findUnique({ where: { id: other.id } });
  assert.equal(afterOther?.email, beforeOther?.email);

  section("phone-not-verified cannot submit onboarding email");
  const noPhone = await track(
    await prisma.user.create({
      data: {
        email: `${TAG}-nophone@example.com`,
        passwordHash: null,
        firstName: "No",
        emailVerified: true,
        phoneVerified: false,
        authOnboardingComplete: false,
      },
    })
  );
  const rejected = await completePhoneFirstOnboarding(noPhone.id, {
    firstName: "No",
    lastName: "Phone",
    email: `${TAG}-nophone2@example.com`,
  });
  assert.equal(rejected.ok, false);
  if (!rejected.ok) assert.equal(rejected.kind, "phone_not_verified");

  // Touch randomBytes so token-generation path stays imported in mental model
  assert.ok(randomBytes(4).length === 4);
  assert.ok(randomUUID());

  console.log("\nAll Phase 3 onboarding checks passed.");
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
