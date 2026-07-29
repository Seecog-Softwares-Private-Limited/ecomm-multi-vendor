import { NextRequest } from "next/server";
import {
  withApiHandler,
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiBadRequest,
  type ApiRouteContext,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { toggleReviewHelpfulVote } from "@/lib/data/reviews";
import { uuid, parseWithDetails } from "@/lib/validation";

type RouteContext = { params?: Promise<Record<string, string | string[]>> };

/**
 * POST /api/reviews/:id/helpful — toggle helpful vote.
 */
export const POST = withApiHandler(async (request: NextRequest, context?: RouteContext) => {
  const session = await getSession(request);
  if (!session) return apiUnauthorized("Please log in.");
  if (session.role !== "CUSTOMER") return apiForbidden("Only customers can vote on reviews.");

  const params = context?.params ? await context.params : {};
  const rawId = typeof params.id === "string" ? params.id : params.id?.[0];
  const idParsed = parseWithDetails(uuid, rawId);
  if (!idParsed.success) return apiBadRequest("Invalid review id");

  const result = await toggleReviewHelpfulVote(session.sub, idParsed.data);
  if (result === "NOT_FOUND") return apiNotFound("Review not found.");
  if (result === "FORBIDDEN") {
    return apiForbidden("You cannot vote on your own review.");
  }

  return apiSuccess(result);
});
