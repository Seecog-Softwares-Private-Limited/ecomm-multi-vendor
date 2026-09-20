/**
 * Vendor phone OTP login: reuse existing Seller, never duplicate, conflict on
 * multiple active phones. Does not send SMS.
 *
 * Run: npx tsx scripts/test-vendor-phone-otp-login.ts
 */
import assert from "node:assert/strict";
import { PrismaClient, SellerStatus, KYCDocumentType, KYCStatus } from "@prisma/client";
import { normalizeIndianPhone } from "../src/lib/auth/phone";
import {
  sellerStoredPhoneMatchesNorm,
  resolveActiveSellerByPhoneNorm,
  ensureSellerForVendorPhoneOtp,
  markSellerPhoneOtpVerified,
  findActiveSellersByPhoneNorm,
  PHONE_ACCOUNT_CONFLICT_CODE,
} from "../src/lib/auth/seller-onboarding";

const prisma = new PrismaClient();
const TAG = `votp-${Date.now().toString(36)}`;
const sellerIds: string[] = [];
const userIds: string[] = [];

function section(t: string) {
  console.log(`\n== ${t} ==`);
}

function nationalPhone(suffix: string): string {
  const n = `81${suffix}`.slice(0, 10);
  assert.equal(n.length, 10);
  return n;
}

function trackSeller<T extends { id: string }>(row: T): T {
  sellerIds.push(row.id);
  return row;
}

async function cleanup() {
  if (sellerIds.length) {
    await prisma.kYCDocument.deleteMany({ where: { sellerId: { in: sellerIds } } });
    await prisma.seller.deleteMany({ where: { id: { in: sellerIds } } });
  }
  if (userIds.length) {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
}

async function main() {
  section("pure: stored phone matches existing normalizeIndianPhone");
  const phoneNorm = normalizeIndianPhone("9876543210");
  assert.equal(phoneNorm, "919876543210");
  assert.equal(sellerStoredPhoneMatchesNorm("9876543210", phoneNorm!), true);
  assert.equal(sellerStoredPhoneMatchesNorm("+919876543210", phoneNorm!), true);
  assert.equal(sellerStoredPhoneMatchesNorm("919876543210", phoneNorm!), true);
  assert.equal(sellerStoredPhoneMatchesNorm("+91 98765 43210", phoneNorm!), true);
  assert.equal(sellerStoredPhoneMatchesNorm("9999999999", phoneNorm!), false);
  assert.equal(sellerStoredPhoneMatchesNorm(null, phoneNorm!), false);
  assert.equal(PHONE_ACCOUNT_CONFLICT_CODE, "PHONE_ACCOUNT_CONFLICT");

  const stamp = String(Date.now()).slice(-8);
  const nExisting = nationalPhone(`${stamp}`.replace(/^/, "1").slice(0, 8));
  const nNew = nationalPhone(`${Number(stamp) + 1}`.slice(-8));
  const nConflict = nationalPhone(`${Number(stamp) + 2}`.slice(-8));
  const nCustomer = nationalPhone(`${Number(stamp) + 3}`.slice(-8));
  const nDeleted = nationalPhone(`${Number(stamp) + 4}`.slice(-8));
  const nPlus = nationalPhone(`${Number(stamp) + 5}`.slice(-8));

  const existingNorm = `91${nExisting}`;
  const newNorm = `91${nNew}`;
  const conflictNorm = `91${nConflict}`;
  const customerNorm = `91${nCustomer}`;
  const deletedNorm = `91${nDeleted}`;
  const plusNorm = `91${nPlus}`;

  section("Test 1 — existing Seller (10-digit stored) is reused, no new row");
  const existing = trackSeller(
    await prisma.seller.create({
      data: {
        email: `${TAG}-existing@example.com`,
        passwordHash: "hash-keep-me",
        businessName: "Existing Shop",
        ownerName: "Existing Owner",
        phone: nExisting,
        status: SellerStatus.APPROVED,
        emailVerified: true,
        phoneVerified: false,
        authOnboardingComplete: true,
        oauthProvider: "google",
        oauthProviderId: `sub-${TAG}-existing`,
      },
    })
  );
  const beforeCount = await prisma.seller.count({
    where: { deletedAt: null, id: { in: sellerIds } },
  });
  const ensuredExisting = await ensureSellerForVendorPhoneOtp(existingNorm);
  assert.equal(ensuredExisting.kind, "ok");
  if (ensuredExisting.kind !== "ok") throw new Error("expected ok");
  assert.equal(ensuredExisting.created, false);
  assert.equal(ensuredExisting.seller.id, existing.id);
  const afterEnsureCount = await prisma.seller.count({
    where: { deletedAt: null, id: { in: sellerIds } },
  });
  assert.equal(afterEnsureCount, beforeCount);

  const resolvedExisting = await resolveActiveSellerByPhoneNorm(existingNorm);
  assert.equal(resolvedExisting.kind, "one");
  if (resolvedExisting.kind !== "one") throw new Error("expected one");
  assert.equal(resolvedExisting.seller.id, existing.id);

  section("Test 3 — OTP verify does not overwrite identity / KYC fields");
  await prisma.kYCDocument.create({
    data: {
      sellerId: existing.id,
      documentType: KYCDocumentType.PAN,
      identifier: "ABCDE1234F",
      status: KYCStatus.APPROVED,
    },
  });
  await markSellerPhoneOtpVerified(existing.id, existingNorm);
  const preserved = await prisma.seller.findUnique({
    where: { id: existing.id },
    include: { kycDocuments: true },
  });
  assert.ok(preserved);
  assert.equal(preserved!.id, existing.id);
  assert.equal(preserved!.email, `${TAG}-existing@example.com`);
  assert.equal(preserved!.passwordHash, "hash-keep-me");
  assert.equal(preserved!.businessName, "Existing Shop");
  assert.equal(preserved!.status, SellerStatus.APPROVED);
  assert.equal(preserved!.oauthProvider, "google");
  assert.equal(preserved!.oauthProviderId, `sub-${TAG}-existing`);
  assert.equal(preserved!.phone, existingNorm);
  assert.equal(preserved!.phoneVerified, true);
  assert.equal(preserved!.kycDocuments.length, 1);
  assert.equal(preserved!.kycDocuments[0].identifier, "ABCDE1234F");
  assert.equal(preserved!.kycDocuments[0].status, KYCStatus.APPROVED);

  section("Test 2 — new phone creates one incomplete Seller");
  const ensuredNew = await ensureSellerForVendorPhoneOtp(newNorm);
  assert.equal(ensuredNew.kind, "ok");
  if (ensuredNew.kind !== "ok") throw new Error("expected ok");
  assert.equal(ensuredNew.created, true);
  trackSeller(ensuredNew.seller);
  assert.equal(ensuredNew.seller.phone, newNorm);
  assert.equal(ensuredNew.seller.phoneVerified, false);
  assert.equal(ensuredNew.seller.authOnboardingComplete, false);
  assert.equal(ensuredNew.seller.status, SellerStatus.DRAFT);
  assert.equal(ensuredNew.seller.businessName, "Pending");
  const ensuredNewAgain = await ensureSellerForVendorPhoneOtp(newNorm);
  assert.equal(ensuredNewAgain.kind, "ok");
  if (ensuredNewAgain.kind !== "ok") throw new Error("expected ok");
  assert.equal(ensuredNewAgain.created, false);
  assert.equal(ensuredNewAgain.seller.id, ensuredNew.seller.id);
  const newMatches = await findActiveSellersByPhoneNorm(newNorm);
  assert.equal(newMatches.length, 1);

  section("Test 4 — duplicate active phones → PHONE_ACCOUNT_CONFLICT, no new Seller");
  const conflictA = trackSeller(
    await prisma.seller.create({
      data: {
        email: `${TAG}-conflict-a@example.com`,
        passwordHash: null,
        businessName: "Conflict A",
        ownerName: "Owner A",
        phone: nConflict,
        status: SellerStatus.APPROVED,
        emailVerified: true,
        phoneVerified: false,
        authOnboardingComplete: true,
      },
    })
  );
  const conflictB = trackSeller(
    await prisma.seller.create({
      data: {
        email: `${TAG}-conflict-b@example.com`,
        passwordHash: null,
        businessName: "Conflict B",
        ownerName: "Owner B",
        phone: `+91${nConflict}`,
        status: SellerStatus.APPROVED,
        emailVerified: true,
        phoneVerified: false,
        authOnboardingComplete: true,
      },
    })
  );
  const beforeConflict = await prisma.seller.count({
    where: { id: { in: [conflictA.id, conflictB.id] } },
  });
  const conflictResolved = await resolveActiveSellerByPhoneNorm(conflictNorm);
  assert.equal(conflictResolved.kind, "conflict");
  if (conflictResolved.kind !== "conflict") throw new Error("expected conflict");
  assert.equal(conflictResolved.sellers.length, 2);
  const ids = conflictResolved.sellers.map((s) => s.id).sort();
  assert.deepEqual(ids, [conflictA.id, conflictB.id].sort());

  const ensuredConflict = await ensureSellerForVendorPhoneOtp(conflictNorm);
  assert.equal(ensuredConflict.kind, "conflict");
  const afterConflict = await prisma.seller.count({
    where: { id: { in: [conflictA.id, conflictB.id] } },
  });
  assert.equal(afterConflict, beforeConflict);
  const extra = await prisma.seller.findMany({
    where: {
      deletedAt: null,
      email: { startsWith: `${TAG}-conflict-` },
    },
  });
  assert.equal(extra.length, 2);

  section("Test 5 — Customer User with same phone is ignored");
  const vendorForIso = trackSeller(
    await prisma.seller.create({
      data: {
        email: `${TAG}-iso-vendor@example.com`,
        passwordHash: null,
        businessName: "Iso Shop",
        ownerName: "Iso Owner",
        phone: customerNorm,
        status: SellerStatus.APPROVED,
        emailVerified: true,
        phoneVerified: false,
        authOnboardingComplete: true,
      },
    })
  );
  const customer = await prisma.user.create({
    data: {
      email: `${TAG}-iso-customer@example.com`,
      phone: customerNorm,
      firstName: "Cust",
      lastName: "Omer",
      phoneVerified: true,
    },
  });
  userIds.push(customer.id);
  const iso = await resolveActiveSellerByPhoneNorm(customerNorm);
  assert.equal(iso.kind, "one");
  if (iso.kind !== "one") throw new Error("expected one");
  assert.equal(iso.seller.id, vendorForIso.id);
  assert.notEqual(iso.seller.id, customer.id);

  section("Test 6 — soft-deleted Seller is not reused; new incomplete is created");
  const doomed = trackSeller(
    await prisma.seller.create({
      data: {
        email: `${TAG}-deleted@example.com`,
        passwordHash: null,
        businessName: "Gone Shop",
        ownerName: "Gone Owner",
        phone: deletedNorm,
        status: SellerStatus.APPROVED,
        emailVerified: true,
        phoneVerified: true,
        authOnboardingComplete: true,
        deletedAt: new Date(),
      },
    })
  );
  const afterDelete = await resolveActiveSellerByPhoneNorm(deletedNorm);
  assert.equal(afterDelete.kind, "none");
  const ensuredDeleted = await ensureSellerForVendorPhoneOtp(deletedNorm);
  assert.equal(ensuredDeleted.kind, "ok");
  if (ensuredDeleted.kind !== "ok") throw new Error("expected ok");
  assert.equal(ensuredDeleted.created, true);
  trackSeller(ensuredDeleted.seller);
  assert.notEqual(ensuredDeleted.seller.id, doomed.id);
  assert.equal(ensuredDeleted.seller.authOnboardingComplete, false);
  assert.equal(ensuredDeleted.seller.phoneVerified, false);

  section("+91 stored format still resolves to the same Seller");
  const plusSeller = trackSeller(
    await prisma.seller.create({
      data: {
        email: `${TAG}-plus@example.com`,
        passwordHash: null,
        businessName: "Plus Shop",
        ownerName: "Plus Owner",
        phone: `+91${nPlus}`,
        status: SellerStatus.DRAFT,
        emailVerified: false,
        phoneVerified: false,
        authOnboardingComplete: false,
      },
    })
  );
  const plusResolved = await resolveActiveSellerByPhoneNorm(plusNorm);
  assert.equal(plusResolved.kind, "one");
  if (plusResolved.kind !== "one") throw new Error("expected one");
  assert.equal(plusResolved.seller.id, plusSeller.id);
  const plusEnsured = await ensureSellerForVendorPhoneOtp(plusNorm);
  assert.equal(plusEnsured.kind, "ok");
  if (plusEnsured.kind !== "ok") throw new Error("expected ok");
  assert.equal(plusEnsured.created, false);
  assert.equal(plusEnsured.seller.id, plusSeller.id);

  console.log("\nVendor phone OTP login tests passed.\n");
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
