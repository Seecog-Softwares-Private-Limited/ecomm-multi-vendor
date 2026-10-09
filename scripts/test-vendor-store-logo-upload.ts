/**
 * Store logo upload: onboarding statuses vs product-image gate.
 * Run: npx tsx scripts/test-vendor-store-logo-upload.ts
 */

import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { PrismaClient, SellerStatus } from "@prisma/client";
import { signToken } from "../src/lib/auth/jwt";
import {
  getVendorProfile,
  updateVendorProfile,
} from "../src/lib/data/vendor-profile";
import { MAX_UPLOAD_SIZE_BYTES } from "../src/lib/uploads/limits";

const prisma = new PrismaClient();
const TAG = `vlogo-${Date.now().toString(36)}`;
const created: string[] = [];
const writtenFiles: string[] = [];

/** Minimal valid 1×1 PNG */
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

function section(t: string) {
  console.log(`\n== ${t} ==`);
}

async function track<T extends { id: string }>(s: T): Promise<T> {
  created.push(s.id);
  return s;
}

async function createSeller(status: SellerStatus, suffix: string) {
  return track(
    await prisma.seller.create({
      data: {
        email: `${TAG}-${suffix}@example.com`,
        passwordHash: null,
        businessName: `Shop ${suffix}`,
        ownerName: "Owner Name",
        phone: `91${String(8000000000 + Math.floor(Math.random() * 1e9)).slice(0, 10)}`,
        status,
        emailVerified: true,
        phoneVerified: true,
        authOnboardingComplete: true,
        profileExtras: JSON.stringify({}),
      },
    })
  );
}

async function bearer(sellerId: string, email: string) {
  return signToken({ sub: sellerId, email, role: "SELLER" });
}

function pngFormData(name = "logo.png", bytes: Buffer = TINY_PNG, type = "image/png") {
  const form = new FormData();
  form.append("file", new Blob([bytes], { type }), name);
  return form;
}

async function postLogo(token: string | null, form: FormData) {
  const { POST } = await import("../app/api/vendor/profile/logo/route");
  const headers = new Headers();
  if (token) headers.set("authorization", `Bearer ${token}`);
  const req = new NextRequest("http://localhost/api/vendor/profile/logo", {
    method: "POST",
    headers,
    body: form,
  });
  return POST(req, { params: Promise.resolve({}) });
}

async function postProductUpload(token: string, form: FormData) {
  const { POST } = await import("../app/api/vendor/upload/route");
  const req = new NextRequest("http://localhost/api/vendor/upload", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });
  return POST(req, { params: Promise.resolve({}) });
}

async function parseJson(res: Response) {
  return res.json() as Promise<{
    success?: boolean;
    data?: { url?: string };
    error?: { message?: string; code?: string };
  }>;
}

function trackUrlFile(url: string, uploadRoot: string) {
  const marker = "/uploads/";
  const i = url.indexOf(marker);
  if (i === -1) return;
  const rel = url.slice(i + marker.length).split("?")[0];
  if (rel) writtenFiles.push(path.join(uploadRoot, ...rel.split("/")));
}

async function main() {
  const uploadRoot = await mkdtemp(path.join(os.tmpdir(), "ecomm-logo-"));
  process.env.PUBLIC_UPLOAD_ROOT = uploadRoot;
  await mkdir(uploadRoot, { recursive: true });

  section("Draft vendor can upload store logo");
  const draft = await createSeller(SellerStatus.DRAFT, "draft");
  const draftToken = await bearer(draft.id, draft.email);
  let res = await postLogo(draftToken, pngFormData());
  assert.equal(res.status, 200, `draft upload status ${res.status}`);
  let json = await parseJson(res);
  assert.equal(json.success, true);
  assert.ok(json.data?.url?.includes("/uploads/"), "draft url");
  trackUrlFile(json.data!.url!, uploadRoot);
  const draftLogoUrl = json.data!.url!;

  section("Draft: save logo URL on profile and reload");
  await updateVendorProfile(draft.id, {
    business: { storeLogo: draftLogoUrl, displayName: draft.businessName },
  });
  const draftProfile = await getVendorProfile(draft.id);
  assert.equal(draftProfile?.business.storeLogo, draftLogoUrl);

  section("Submitted (under review) vendor can upload store logo");
  const submitted = await createSeller(SellerStatus.SUBMITTED, "sub");
  const subToken = await bearer(submitted.id, submitted.email);
  res = await postLogo(subToken, pngFormData("under-review.png"));
  assert.equal(res.status, 200);
  json = await parseJson(res);
  assert.ok(json.data?.url);
  trackUrlFile(json.data!.url!, uploadRoot);

  section("Rejected vendor can upload store logo");
  const rejected = await createSeller(SellerStatus.REJECTED, "rej");
  const rejToken = await bearer(rejected.id, rejected.email);
  res = await postLogo(rejToken, pngFormData("rejected.png"));
  assert.equal(res.status, 200);
  json = await parseJson(res);
  assert.ok(json.data?.url);
  trackUrlFile(json.data!.url!, uploadRoot);

  section("Approved vendor can upload store logo");
  const approved = await createSeller(SellerStatus.APPROVED, "ok");
  const okToken = await bearer(approved.id, approved.email);
  res = await postLogo(okToken, pngFormData("approved.png"));
  assert.equal(res.status, 200);
  json = await parseJson(res);
  assert.ok(json.data?.url);
  const approvedLogoUrl = json.data!.url!;
  trackUrlFile(approvedLogoUrl, uploadRoot);

  section("Approved: logo save goes to pendingStorefront (not live extras.storeLogo only)");
  await updateVendorProfile(approved.id, {
    business: { storeLogo: approvedLogoUrl, displayName: "Pending Name" },
  });
  const sellerRow = await prisma.seller.findUniqueOrThrow({
    where: { id: approved.id },
    select: { profileExtras: true, businessName: true },
  });
  const extras = JSON.parse(sellerRow.profileExtras || "{}") as {
    storeLogo?: string;
    pendingStorefront?: { storeLogo?: string; displayName?: string };
  };
  assert.equal(extras.pendingStorefront?.storeLogo, approvedLogoUrl);
  assert.notEqual(extras.storeLogo, approvedLogoUrl);
  const approvedView = await getVendorProfile(approved.id);
  assert.equal(approvedView?.business.storeLogo, approvedLogoUrl);

  section("Unauthenticated → 401");
  res = await postLogo(null, pngFormData());
  assert.equal(res.status, 401);
  json = await parseJson(res);
  assert.equal(json.success, false);

  section("Invalid file type rejected");
  res = await postLogo(
    draftToken,
    pngFormData("notes.txt", Buffer.from("not-an-image"), "text/plain")
  );
  assert.equal(res.status, 400);
  json = await parseJson(res);
  assert.match(json.error?.message ?? "", /Invalid file type/i);

  section("Oversized file rejected");
  const huge = Buffer.alloc(MAX_UPLOAD_SIZE_BYTES + 1, 1);
  // Prefix with PNG magic so type sniffing alone cannot bypass size check
  TINY_PNG.copy(huge, 0, 0, Math.min(TINY_PNG.length, huge.length));
  res = await postLogo(draftToken, pngFormData("huge.png", huge, "image/png"));
  assert.equal(res.status, 400);
  json = await parseJson(res);
  assert.match(json.error?.message ?? "", /too large/i);

  section("Missing file rejected");
  res = await postLogo(draftToken, new FormData());
  assert.equal(res.status, 400);

  section("Unapproved vendor still 403 on product-image upload");
  res = await postProductUpload(draftToken, pngFormData("product.png"));
  assert.equal(res.status, 403);
  json = await parseJson(res);
  assert.equal(json.error?.code, "ACCOUNT_NOT_APPROVED");

  section("Uploaded file is readable under PUBLIC_UPLOAD_ROOT");
  const rel = draftLogoUrl.split("/uploads/")[1];
  assert.ok(rel);
  const onDisk = path.join(uploadRoot, ...rel.split("/"));
  const diskBytes = await readFile(onDisk);
  assert.ok(diskBytes.length >= 8);
  // Touch marker so cleanup knows (already tracked)
  await writeFile(path.join(uploadRoot, ".ok"), "1");

  console.log("\nVendor store logo upload tests passed.\n");
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (created.length) {
      await prisma.seller.deleteMany({ where: { id: { in: created } } });
    }
    const root = process.env.PUBLIC_UPLOAD_ROOT;
    if (root?.includes("ecomm-logo-")) {
      await rm(root, { recursive: true, force: true }).catch(() => {});
    }
    await prisma.$disconnect();
  });
