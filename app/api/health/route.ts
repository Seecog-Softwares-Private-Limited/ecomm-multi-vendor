import { withApiHandler, apiSuccess, Status } from "@/lib/api";

/**
 * Health check endpoint. Example of the base API pattern.
 * GET /api/health -> { success: true, data: { ok: true, timestamp: string } }
 */
export const GET = withApiHandler(async () => {
  return apiSuccess(
    { ok: true, timestamp: new Date().toISOString() },
    Status.OK
  );
});
