import { appendFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { resolveVendorGoogleMatch } from "../src/lib/auth/resolve-vendor-google-login";

const prisma = new PrismaClient();

async function main() {
  const email = "sumitkumar302100@gmail.com";
  const byEmail = await prisma.seller.findFirst({
    where: { email, deletedAt: null },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      oauthProvider: true,
      oauthProviderId: true,
    },
  });

  const m = resolveVendorGoogleMatch({
    googleSub: "post-fix-probe-sub",
    googleEmailVerified: true,
    byGoogleSub: null,
    byEmail,
  });

  const line = JSON.stringify({
    sessionId: "337f7e",
    runId: "post-fix",
    hypothesisId: "A",
    location: "live-seller-probe",
    message: "Live Seller resolve after fix",
    data: {
      sellerIdPrefix: byEmail ? byEmail.id.slice(0, 8) : null,
      emailVerified: byEmail?.emailVerified ?? null,
      hasOauth: Boolean(byEmail?.oauthProviderId),
      action: m.action,
      linkGoogle: m.action === "login" ? m.linkGoogle : null,
      code: m.action === "conflict" ? m.code : null,
    },
    timestamp: Date.now(),
  });
  appendFileSync("debug-337f7e.log", line + "\n");
  console.log(line);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
