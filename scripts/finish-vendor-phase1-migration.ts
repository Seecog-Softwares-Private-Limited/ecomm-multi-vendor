import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  // Finish failed migration step: replace non-unique oauth index with unique
  await p.$executeRawUnsafe(`DROP INDEX \`sellers_oauth_idx\` ON \`sellers\``);
  await p.$executeRawUnsafe(
    `CREATE UNIQUE INDEX \`sellers_oauth_provider_oauth_provider_id_key\` ON \`sellers\`(\`oauth_provider\`, \`oauth_provider_id\`)`
  );

  // Ensure active sellers are marked complete (idempotent)
  const updated = await p.seller.updateMany({
    where: { deletedAt: null, authOnboardingComplete: false },
    data: { authOnboardingComplete: true },
  });

  const complete = await p.seller.count({
    where: { deletedAt: null, authOnboardingComplete: true },
  });
  const incomplete = await p.seller.count({
    where: { deletedAt: null, authOnboardingComplete: false },
  });

  console.log(JSON.stringify({ updated: updated.count, complete, incomplete }));
  await p.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
});
