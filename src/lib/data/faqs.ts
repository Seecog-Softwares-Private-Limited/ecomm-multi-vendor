import { prisma } from "@/lib/prisma";

export type FaqRow = {
  id: string;
  category: string;
  question: string;
  answer: string;
  displayOrder: number;
};

export async function listFaqs(): Promise<FaqRow[]> {
  const rows = await prisma.faq.findMany({
    where: { deletedAt: null },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      category: true,
      question: true,
      answer: true,
      displayOrder: true,
    },
  });

  return rows;
}
