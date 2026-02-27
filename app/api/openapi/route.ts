import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/openapi";

/**
 * GET /api/openapi — OpenAPI 3.0 JSON spec for Swagger UI.
 */
export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
