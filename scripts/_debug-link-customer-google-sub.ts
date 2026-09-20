/**
 * One-shot: attach the Customer Google sub to the matching Vendor Seller
 * so production Continue with Google can resolve by oauthProviderId.
 * Does not print provider IDs.
 */
import { appendFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { linkGoogleToVendorSeller } from "../src/lib/auth/link-vendor-google";

const prisma = new PrismaClient();
const EMAIL = "sumitkumar302100@gmail.com";

async function main() {
  const seller = await prisma.seller.findFirst({
    where: { email: EMAIL, deletedAt: null },
    select: { id: true, oauthProviderId: true, emailVerified: true },
  });
  const user = await prisma.user.findFirst({
    where: { email: EMAIL, deletedAt: null, oauthProvider: "google" },
    select: { id: true, oauthProviderId: true },
  });

  if (!seller) throw new Error("Seller not found");
  if (!user?.oauthProviderId?.trim()) throw new Error("Customer Google sub missing");

  const before = {
    sellerIdPrefix: seller.id.slice(0, 8),
    hadOauth: Boolean(seller.oauthProviderId),
    emailVerified: seller.emailVerified,
  };

  if (seller.oauthProviderId === user.oauthProviderId) {
    const line = JSON.stringify({
      sessionId: "337f7e",
      runId: "post-fix",
      hypothesisId: "F",
      location: "link-customer-sub-to-seller",
      message: "Already linked — no write",
      data: before,
      timestamp: Date.now(),
    });
    appendFileSync("debug-337f7e.log", line + "\n");
    console.log(line);
    return;
  }

  const result = await linkGoogleToVendorSeller(seller.id, user.oauthProviderId);
  const after = await prisma.seller.findFirst({
    where: { id: seller.id },
    select: { oauthProvider: true, oauthProviderId: true, emailVerified: true },
  });

  const line = JSON.stringify({
    sessionId: "337f7e",
    runId: "post-fix",
    hypothesisId: "F",
    location: "link-customer-sub-to-seller",
    message: "Linked Customer Google sub to Vendor Seller",
    data: {
      ...before,
      alreadyLinked: result.alreadyLinked,
      afterOauth: after?.oauthProvider ?? null,
      afterHasOauthId: Boolean(after?.oauthProviderId),
      afterEmailVerified: after?.emailVerified ?? null,
    },
    timestamp: Date.now(),
  });
  appendFileSync("debug-337f7e.log", line + "\n");
  console.log(line);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
