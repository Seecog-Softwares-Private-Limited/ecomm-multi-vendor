import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api";
import { listFaqs } from "@/lib/data/faqs";

/**
 * GET /api/faqs — public FAQ list ordered by displayOrder.
 */
export const GET = withApiHandler(async () => {
  const faqs = await listFaqs();
  return apiSuccess({ faqs });
});
