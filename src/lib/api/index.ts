/**
 * Base API pattern for Next.js App Router.
 *
 * Usage in route handlers:
 *
 *   import { withApiHandler, apiSuccess, apiError, apiNotFound, Status } from "@/lib/api";
 *
 *   export const GET = withApiHandler(async (req, ctx) => {
 *     const data = await getData();
 *     return apiSuccess(data, Status.OK);
 *   });
 *
 *   export const GET = withApiHandler(async (req, ctx) => {
 *     const item = await getItem();
 *     if (!item) return apiNotFound();
 *     return apiSuccess(item);
 *   });
 */

export {
  type ApiSuccessResponse,
  type ApiErrorResponse,
  type ApiResponse,
  type ApiMeta,
  isApiSuccess,
  isApiError,
} from "./types";

export { Status, ERROR_STATUS_MAP, type StatusCode } from "./status";

export {
  apiSuccess,
  apiError,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiMethodNotAllowed,
  apiConflict,
  apiValidationError,
  apiInternalError,
  apiNoContent,
} from "./response";

export {
  withApiHandler,
  ApiRouteError,
  throwNotFound,
  throwBadRequest,
  throwUnauthorized,
  throwForbidden,
  throwConflict,
  throwValidation,
  type ApiRouteHandler,
  type ApiRouteContext,
} from "./handler";
