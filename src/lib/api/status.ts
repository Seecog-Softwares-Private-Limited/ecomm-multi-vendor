/**
 * HTTP status codes for consistent API responses.
 * Use these instead of magic numbers in route handlers.
 */
export const Status = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type StatusCode = (typeof Status)[keyof typeof Status];

/** Maps common error cases to HTTP status codes. */
export const ERROR_STATUS_MAP = {
  BadRequest: Status.BAD_REQUEST,
  Unauthorized: Status.UNAUTHORIZED,
  Forbidden: Status.FORBIDDEN,
  NotFound: Status.NOT_FOUND,
  Conflict: Status.CONFLICT,
  Validation: Status.UNPROCESSABLE_ENTITY,
  Internal: Status.INTERNAL_SERVER_ERROR,
} as const;
