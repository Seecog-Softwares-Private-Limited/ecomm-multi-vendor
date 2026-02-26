/**
 * Central validation layer: reusable Zod schemas and parse helpers.
 * Use parseWithDetails in route handlers before DB operations; return apiValidationError with details on failure.
 */

export {
  requiredString,
  uuid,
  slug,
  limitSchema,
  offsetSchema,
  limitQuerySchema,
  getProductsQuerySchema,
  productIdParamSchema,
  limitOnlyQuerySchema,
  createVendorProductSchema,
} from "./schemas";
export type {
  GetProductsQuery,
  ProductIdParam,
  LimitOnlyQuery,
  CreateVendorProductInput,
} from "./schemas";

export {
  formatValidationDetails,
  parseWithDetails,
  type ParseResult,
  type ParseSuccess,
  type ParseFailure,
} from "./parse";
