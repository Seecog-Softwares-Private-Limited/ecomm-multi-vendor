/**
 * Verify which database Prisma connects to and how many users exist.
 * Run: npx tsx scripts/verify-db-connection.ts
 *
 * Compare the printed "Current database" with the schema you have open in MySQL Workbench.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  const dbFromUrl = url.split("/").pop()?.split("?")[0] ?? "?";
  console.log("From .env DATABASE_URL, database name is:", dbFromUrl);

  const count = await prisma.user.count();
  console.log("prisma.user.count() =", count);

  try {
    const rows = await prisma.$queryRaw<[{ "DATABASE()": string }]>`SELECT DATABASE()`;
    const currentDb = rows[0]?.["DATABASE()"] ?? "?";
    console.log("Current database (from MySQL):", currentDb);
    if (currentDb !== dbFromUrl) {
      console.log("MISMATCH: URL says", dbFromUrl, "but MySQL is using", currentDb);
    }
  } catch (e) {
    console.log("Could not run SELECT DATABASE():", (e as Error).message);
  }

  if (count > 0) {
    const first = await prisma.user.findFirst({ select: { id: true, email: true } });
    console.log("First user:", first?.email ?? "—");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
