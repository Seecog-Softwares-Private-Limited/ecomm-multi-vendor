/**
 * Parse input with Zod and return either typed data or structured error details
 * for API responses. Use before any DB operation in route handlers.
 */

import type { z } from "zod";

/** Format Zod issues into a flat map of field path -> message for API error details. */
export function formatValidationDetails(
  issues: z.ZodIssue[]
): Record<string, string> {
  const details: Record<string, string> = {};
  for (const issue of issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "body";
    if (!details[path]) details[path] = issue.message;
  }
  return details;
}

export type ParseSuccess<T> = { success: true; data: T };
export type ParseFailure = {
  success: false;
  details: Record<string, string>;
  issues: z.ZodIssue[];
};

export type ParseResult<T> = ParseSuccess<T> | ParseFailure;

/**
 * Parse input with schema. Returns typed data or structured details for apiValidationError.
 * Use in route handlers: validate before DB, return 422 with details on failure.
 */
export function parseWithDetails<T>(
  schema: z.ZodType<T>,
  input: unknown
): ParseResult<T> {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    details: formatValidationDetails(result.error.issues),
    issues: result.error.issues,
  };
}
