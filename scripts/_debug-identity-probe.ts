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
  const user = await prisma.user.findFirst({
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
    runId: "post-fix",
    hypothesisId: "F",
    location: "identity-probe",
    message: "Seller vs Customer Google link state",
    data: {
      sellerIdPrefix: seller ? seller.id.slice(0, 8) : null,
      sellerEmailVerified: seller?.emailVerified ?? null,
      sellerOauth: seller?.oauthProvider ?? null,
      sellerHasOauthId: Boolean(seller?.oauthProviderId),
      userIdPrefix: user ? user.id.slice(0, 8) : null,
      userOauth: user?.oauthProvider ?? null,
      userHasOauthId: Boolean(user?.oauthProviderId),
      sameOauthId:
        Boolean(seller?.oauthProviderId) &&
        seller?.oauthProviderId === user?.oauthProviderId,
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
