import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, apiBadRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { parseBannerPlacement } from "@/lib/banners";

export const dynamic = "force-dynamic";

/**
 * GET /api/banners?placement=HERO|PROMO — active home page banners (public).
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const placement = parseBannerPlacement(request.nextUrl.searchParams.get("placement"));
  if (!placement) return apiBadRequest("Invalid placement");

  const banners = await prisma.banner.findMany({
    where: { placement, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      imageUrl: true,
      title: true,
      subtitle: true,
      ctaText: true,
      linkUrl: true,
    },
  });

  return apiSuccess(banners);
});
