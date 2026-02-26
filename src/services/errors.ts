/**
 * Centralized service-layer errors.
 * Thrown by the fetch client when API returns error or request fails.
 */

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string = "SERVICE_ERROR",
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ServiceError";
    Object.setPrototypeOf(this, ServiceError.prototype);
  }

  /** Whether the error is due to invalid credentials / unauthenticated. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Whether the error is due to validation (e.g. 422). */
  get isValidation(): boolean {
    return this.status === 422;
  }

  /** Whether the error is "not found" (404). */
  get isNotFound(): boolean {
    return this.status === 404;
  }
}
