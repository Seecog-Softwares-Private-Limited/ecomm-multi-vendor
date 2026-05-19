/**
 * Hard-delete customer (User) accounts and related rows by email pattern.
 * Targets local parts: agrawallakshya010, lakshyaagrawal010 (any domain).
 *
 * Run: npx tsx scripts/delete-customers-by-email.ts
 */
import { PrismaClient } from "@prisma/client";
import { hardDeleteCustomerAccount } from "../src/lib/auth/delete-customer-account";

const prisma = new PrismaClient();

/** Match if email contains any of these substrings (case-insensitive via filter). */
const LOCAL_PART_MARKERS = ["agrawallakshya010", "lakshyaagrawal010"];

function matchesTarget(email: string): boolean {
  const e = email.toLowerCase();
  return LOCAL_PART_MARKERS.some((m) => e.includes(m.toLowerCase()));
}

async function main() {
  const allUsers = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, email: true },
  });

  const targets = allUsers.filter((u) => matchesTarget(u.email));

  if (targets.length === 0) {
    console.log("No users found matching:", LOCAL_PART_MARKERS.join(", "));
    return;
  }

  console.log(
    "Deleting customer user(s):",
    targets.map((t) => t.email).join(", ")
  );

  for (const { id } of targets) {
    await hardDeleteCustomerAccount(id);
  }
  console.log("Removed", targets.length, "user account(s). Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
