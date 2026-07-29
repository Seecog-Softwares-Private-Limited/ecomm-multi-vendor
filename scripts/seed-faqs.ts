/**
 * Seed FAQs from static Help Center content.
 * Run: npx tsx scripts/seed-faqs.ts
 */
import { PrismaClient } from "@prisma/client";
import { SUPPORT_FAQS } from "../src/lib/support/support-faq-data.ts";

const prisma = new PrismaClient();

async function main() {
  let order = 0;
  for (const faq of SUPPORT_FAQS) {
    order += 10;
    await prisma.faq.upsert({
      where: { id: faq.id },
      create: {
        id: faq.id,
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        displayOrder: order,
      },
      update: {
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        displayOrder: order,
        deletedAt: null,
      },
    });
  }
  console.log(`seed-faqs: upserted ${SUPPORT_FAQS.length} FAQs`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
