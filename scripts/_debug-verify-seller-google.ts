import { appendFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "sumitkumar302100@gmail.com";
  const seller = await prisma.seller.findFirst({
    where: { email, deletedAt: null },
    select: {
      id: true,
      emailVerified: true,
      oauthProvider: true,
      oauthProviderId: true,
    },
  });
  const line = JSON.stringify({
    sessionId: "337f7e",
    runId: "verify-ready",
    hypothesisId: "F",
    location: "pre-e2e-seller-state",
    message: "Seller Google link ready for Continue with Google",
    data: {
      sellerIdPrefix: seller ? seller.id.slice(0, 8) : null,
      emailVerified: seller?.emailVerified ?? null,
      oauthProvider: seller?.oauthProvider ?? null,
      hasOauthId: Boolean(seller?.oauthProviderId),
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
