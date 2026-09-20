/**
 * Vendor Google login: auto-link verified email/password Sellers.
 * Run: npx tsx scripts/test-vendor-google-login.ts
 */
import assert from "node:assert/strict";
import { PrismaClient, SellerStatus } from "@prisma/client";
import {
  resolveVendorGoogleMatch,
  applyVendorGoogleLogin,
} from "../src/lib/auth/resolve-vendor-google-login";
import {
  GOOGLE_IDENTITY_ALREADY_LINKED_MESSAGE,
  GOOGLE_LINKED_TO_DIFFERENT_IDENTITY_MESSAGE,
  VENDOR_GOOGLE_EMAIL_EXISTS_MESSAGE,
} from "../src/lib/auth/link-vendor-google";

const prisma = new PrismaClient();
const TAG = `vgl-${Date.now().toString(36)}`;
const sellerIds: string[] = [];
const userIds: string[] = [];

function section(t: string) {
  console.log(`\n== ${t} ==`);
}

function trackSeller<T extends { id: string }>(row: T): T {
  sellerIds.push(row.id);
  return row;
}

async function cleanup() {
  if (sellerIds.length) {
    await prisma.seller.deleteMany({ where: { id: { in: sellerIds } } });
  }
  if (userIds.length) {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
}

async function main() {
  section("pure: verified email/password Seller auto-links Google sub");
  const pwd = {
    id: "seller-pwd",
    email: "test@gmail.com",
    emailVerified: true,
    oauthProvider: null,
    oauthProviderId: null,
  };
  const t1 = resolveVendorGoogleMatch({
    googleSub: "GOOGLE_SUB",
    googleEmailVerified: true,
    byGoogleSub: null,
    byEmail: pwd,
  });
  assert.deepEqual(t1, { action: "login", sellerId: "seller-pwd", linkGoogle: true });

  section("pure: already linked Google logs in with no re-link");
  const linked = {
    id: "seller-pwd",
    email: "test@gmail.com",
    emailVerified: true,
    oauthProvider: "google",
    oauthProviderId: "GOOGLE_SUB",
  };
  const t2 = resolveVendorGoogleMatch({
    googleSub: "GOOGLE_SUB",
    googleEmailVerified: true,
    byGoogleSub: linked,
    byEmail: linked,
  });
  assert.deepEqual(t2, { action: "login", sellerId: "seller-pwd", linkGoogle: false });

  section("pure: no Seller → Google-first register");
  const t3 = resolveVendorGoogleMatch({
    googleSub: "new-sub",
    googleEmailVerified: true,
    byGoogleSub: null,
    byEmail: null,
  });
  assert.deepEqual(t3, { action: "register" });

  section("pure: unverified Seller email auto-links when Google email_verified=true");
  const t4 = resolveVendorGoogleMatch({
    googleSub: "GOOGLE_SUB",
    googleEmailVerified: true,
    byGoogleSub: null,
    byEmail: { ...pwd, emailVerified: false },
  });
  assert.deepEqual(t4, { action: "login", sellerId: "seller-pwd", linkGoogle: true });
  const t4b = resolveVendorGoogleMatch({
    googleSub: "GOOGLE_SUB",
    googleEmailVerified: false,
    byGoogleSub: null,
    byEmail: pwd,
  });
  assert.equal(t4b.action, "conflict");
  if (t4b.action === "conflict") {
    assert.equal(t4b.message, VENDOR_GOOGLE_EMAIL_EXISTS_MESSAGE);
  }

  section("pure: Google sub on Seller A + email on Seller B → conflict, no merge");
  const t5 = resolveVendorGoogleMatch({
    googleSub: "SUB-A",
    googleEmailVerified: true,
    byGoogleSub: {
      id: "seller-a",
      email: "a@gmail.com",
      emailVerified: true,
      oauthProvider: "google",
      oauthProviderId: "SUB-A",
    },
    byEmail: {
      id: "seller-b",
      email: "test@gmail.com",
      emailVerified: true,
      oauthProvider: null,
      oauthProviderId: null,
    },
  });
  assert.equal(t5.action, "conflict");
  if (t5.action === "conflict") {
    assert.equal(t5.message, GOOGLE_IDENTITY_ALREADY_LINKED_MESSAGE);
  }

  const t5b = resolveVendorGoogleMatch({
    googleSub: "SUB-NEW",
    googleEmailVerified: true,
    byGoogleSub: null,
    byEmail: {
      id: "seller-b",
      email: "test@gmail.com",
      emailVerified: true,
      oauthProvider: "google",
      oauthProviderId: "SUB-OLD",
    },
  });
  assert.equal(t5b.action, "conflict");
  if (t5b.action === "conflict") {
    assert.equal(t5b.message, GOOGLE_LINKED_TO_DIFFERENT_IDENTITY_MESSAGE);
  }

  const email = `${TAG}@gmail.com`;
  const sub1 = `sub-1-${TAG}`;
  const sub2 = `sub-2-${TAG}`;
  const subNew = `sub-new-${TAG}`;
  const existingPhone = `9181${String(Date.now()).slice(-8)}`.slice(0, 12);

  section("Test 1 — existing verified password Seller: same ID, Google linked, no new row");
  const existing = trackSeller(
    await prisma.seller.create({
      data: {
        email,
        passwordHash: "hash-keep-me",
        businessName: "Existing Shop",
        ownerName: "Existing Owner",
        phone: existingPhone,
        status: SellerStatus.APPROVED,
        emailVerified: true,
        phoneVerified: true,
        authOnboardingComplete: true,
      },
    })
  );
  const beforeCount = await prisma.seller.count({ where: { email } });
  const login1 = await applyVendorGoogleLogin({
    googleSub: sub1,
    email,
    googleEmailVerified: true,
    name: "Should Not Overwrite",
  });
  assert.equal(login1.ok, true);
  if (!login1.ok) throw new Error("expected ok");
  assert.equal(login1.isNew, false);
  assert.equal(login1.seller.id, existing.id);
  const after1 = await prisma.seller.findUnique({ where: { id: existing.id } });
  assert.equal(after1!.passwordHash, "hash-keep-me");
  assert.equal(after1!.email, email);
  assert.equal(after1!.businessName, "Existing Shop");
  assert.equal(after1!.status, SellerStatus.APPROVED);
  assert.equal(after1!.oauthProvider, "google");
  assert.equal(after1!.oauthProviderId, sub1);
  assert.equal(after1!.phone, existingPhone);
  assert.equal(after1!.phoneVerified, true);
  assert.equal(after1!.authOnboardingComplete, true);
  assert.equal(await prisma.seller.count({ where: { email } }), beforeCount);

  section("Test 2 — Google login again uses the same Seller");
  const login2 = await applyVendorGoogleLogin({
    googleSub: sub1,
    email,
    googleEmailVerified: true,
  });
  assert.equal(login2.ok, true);
  if (!login2.ok) throw new Error("expected ok");
  assert.equal(login2.seller.id, existing.id);
  assert.equal(login2.isNew, false);
  assert.equal(await prisma.seller.count({ where: { email } }), 1);

  section("Test 7 — existing phone is not duplicated");
  assert.equal(after1!.phone, existingPhone);
  const phoneOwners = await prisma.seller.count({
    where: { deletedAt: null, phone: existingPhone },
  });
  assert.equal(phoneOwners, 1);

  section("Test 9 — KYC/approval status is unchanged");
  assert.equal(after1!.status, SellerStatus.APPROVED);

  section("Test 6 — Customer User with same email is ignored");
  const customer = await prisma.user.create({
    data: {
      email,
      passwordHash: "cust-hash",
      firstName: "Cust",
      lastName: "Omer",
      emailVerified: true,
    },
  });
  userIds.push(customer.id);
  const loginCust = await applyVendorGoogleLogin({
    googleSub: sub1,
    email,
    googleEmailVerified: true,
  });
  assert.equal(loginCust.ok, true);
  if (!loginCust.ok) throw new Error("expected ok");
  assert.equal(loginCust.seller.id, existing.id);
  const customerAfter = await prisma.user.findUnique({ where: { id: customer.id } });
  assert.equal(customerAfter!.oauthProviderId, null);
  assert.equal(customerAfter!.passwordHash, "cust-hash");

  section("Test 3 — new Google account creates incomplete Seller");
  const newEmail = `${TAG}-new@gmail.com`;
  const created = await applyVendorGoogleLogin({
    googleSub: subNew,
    email: newEmail,
    googleEmailVerified: true,
    name: "New Vendor",
  });
  assert.equal(created.ok, true);
  if (!created.ok) throw new Error("expected ok");
  assert.equal(created.isNew, true);
  trackSeller(created.seller);
  assert.equal(created.seller.email, newEmail);
  assert.equal(created.seller.authOnboardingComplete, false);
  assert.equal(created.seller.phoneVerified, false);
  assert.equal(created.seller.status, SellerStatus.DRAFT);
  const createdRow = await prisma.seller.findUnique({ where: { id: created.seller.id } });
  assert.equal(createdRow!.oauthProviderId, subNew);
  assert.equal(createdRow!.passwordHash, null);

  section("Test 4 — unverified Seller email auto-links when Google email_verified=true");
  const unverified = trackSeller(
    await prisma.seller.create({
      data: {
        email: `${TAG}-unverified@gmail.com`,
        passwordHash: "hash-unverified",
        businessName: "Unverified Shop",
        ownerName: "Unverified Owner",
        status: SellerStatus.PENDING_VERIFICATION,
        emailVerified: false,
        phoneVerified: false,
        authOnboardingComplete: false,
      },
    })
  );
  const unvSub = `sub-unv-${TAG}`;
  const unv = await applyVendorGoogleLogin({
    googleSub: unvSub,
    email: unverified.email,
    googleEmailVerified: true,
  });
  assert.equal(unv.ok, true);
  if (!unv.ok) throw new Error("expected ok");
  assert.equal(unv.isNew, false);
  assert.equal(unv.seller.id, unverified.id);
  const unvAfter = await prisma.seller.findUnique({ where: { id: unverified.id } });
  assert.equal(unvAfter!.oauthProvider, "google");
  assert.equal(unvAfter!.oauthProviderId, unvSub);
  assert.equal(unvAfter!.emailVerified, true);
  assert.equal(unvAfter!.passwordHash, "hash-unverified");
  assert.equal(
    await prisma.seller.count({ where: { email: unverified.email, deletedAt: null } }),
    1
  );

  section("Test 5 — Google identity belongs elsewhere: no merge / no move");
  const sellerA = trackSeller(
    await prisma.seller.create({
      data: {
        email: `${TAG}-a@gmail.com`,
        passwordHash: null,
        businessName: "A Shop",
        ownerName: "Owner A",
        status: SellerStatus.DRAFT,
        emailVerified: true,
        oauthProvider: "google",
        oauthProviderId: sub2,
      },
    })
  );
  const sellerB = trackSeller(
    await prisma.seller.create({
      data: {
        email: `${TAG}-b@gmail.com`,
        passwordHash: "hash-b",
        businessName: "B Shop",
        ownerName: "Owner B",
        status: SellerStatus.APPROVED,
        emailVerified: true,
      },
    })
  );
  const clash = await applyVendorGoogleLogin({
    googleSub: sub2,
    email: sellerB.email,
    googleEmailVerified: true,
  });
  assert.equal(clash.ok, false);
  if (clash.ok) throw new Error("expected fail");
  const aAfter = await prisma.seller.findUnique({ where: { id: sellerA.id } });
  const bAfter = await prisma.seller.findUnique({ where: { id: sellerB.id } });
  assert.equal(aAfter!.oauthProviderId, sub2);
  assert.equal(bAfter!.oauthProviderId, null);
  assert.equal(bAfter!.passwordHash, "hash-b");

  section("Test 8 — incomplete Seller is authenticated, not recreated");
  const incomplete = trackSeller(
    await prisma.seller.create({
      data: {
        email: `${TAG}-inc@gmail.com`,
        passwordHash: "hash-inc",
        businessName: "Pending",
        ownerName: "Pending",
        status: SellerStatus.DRAFT,
        emailVerified: true,
        phoneVerified: false,
        authOnboardingComplete: false,
      },
    })
  );
  const incLogin = await applyVendorGoogleLogin({
    googleSub: `sub-inc-${TAG}`,
    email: incomplete.email,
    googleEmailVerified: true,
  });
  assert.equal(incLogin.ok, true);
  if (!incLogin.ok) throw new Error("expected ok");
  assert.equal(incLogin.isNew, false);
  assert.equal(incLogin.seller.id, incomplete.id);
  assert.equal(incLogin.seller.authOnboardingComplete, false);
  const incAfter = await prisma.seller.findUnique({ where: { id: incomplete.id } });
  assert.equal(incAfter!.passwordHash, "hash-inc");
  assert.equal(incAfter!.oauthProviderId, `sub-inc-${TAG}`);
  assert.equal(
    await prisma.seller.count({ where: { email: incomplete.email, deletedAt: null } }),
    1
  );

  console.log("\nVendor Google login tests passed.\n");
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
