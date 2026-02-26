import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api";
import { clearAuthCookie } from "@/lib/auth";

export const POST = withApiHandler(async (_request: NextRequest) => {
  const response = apiSuccess({ ok: true });
  clearAuthCookie(response);
  return response;
});
