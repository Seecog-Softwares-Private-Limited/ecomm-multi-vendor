import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const cols = await p.$queryRawUnsafe(
    "SHOW COLUMNS FROM sellers LIKE 'auth_onboarding_complete'"
  );
  const pwd = await p.$queryRawUnsafe(
    "SHOW COLUMNS FROM sellers LIKE 'password_hash'"
  );
  const idx = await p.$queryRawUnsafe("SHOW INDEX FROM sellers");
  const oauthIdx = (idx as Array<{ Key_name: string; Column_name: string }>).filter(
    (r) =>
      r.Column_name === "oauth_provider" ||
      r.Column_name === "oauth_provider_id" ||
      r.Key_name.includes("oauth")
  );
  console.log(
    JSON.stringify(
      { cols, pwd, oauthIdx },
      (_, v) => (typeof v === "bigint" ? Number(v) : v),
      2
    )
  );
  await p.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
});
