import { withApiHandler, apiSuccess } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/careers/openings — published roles for storefront (public).
 */
export const GET = withApiHandler(async () => {
  try {
    const openings = await prisma.careerOpening.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        employmentType: true,
        description: true,
      },
    });
    return apiSuccess({ openings });
  } catch {
    return apiSuccess({ openings: [] });
  }
});
