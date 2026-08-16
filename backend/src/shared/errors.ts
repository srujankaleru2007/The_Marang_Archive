/**
 * Error hierarchy per TRD §20.1.
 *
 * `MarangError` is the base class for all errors that may cross a module
 * boundary. Subclasses carry a machine-readable `code` (see TRD §6.5) and an
 * HTTP `statusCode`. `details` holds optional field-level context for
 * validation failures.
 */

export class MarangError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(code: string, statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, new.target);
  }
}

/** Source errors (caught at the adapter boundary, never raw). */
export class SourceUnavailableError extends MarangError {
  constructor(message: string, details?: unknown) {
    super("SOURCE_UNAVAILABLE", 503, message, details);
  }
}

export class SourceTimeoutError extends MarangError {
  constructor(message: string, details?: unknown) {
    super("SOURCE_TIMEOUT", 504, message, details);
  }
}

export class SourceParseError extends MarangError {
  constructor(message: string, details?: unknown) {
    super("SOURCE_PARSE_ERROR", 502, message, details);
  }
}

export class SourceRateLimitError extends MarangError {
  constructor(message: string, details?: unknown) {
    super("SOURCE_RATE_LIMITED", 429, message, details);
  }
}

/** Domain errors. */
export class NotFoundError extends MarangError {
  constructor(message: string, details?: unknown) {
    super("NOT_FOUND", 404, message, details);
  }
}

export class ConflictError extends MarangError {
  constructor(message: string, details?: unknown) {
    super("CONFLICT", 409, message, details);
  }
}

export class ValidationError extends MarangError {
  constructor(message: string, details?: unknown) {
    super("VALIDATION_ERROR", 400, message, details);
  }
}

export class UnauthorizedError extends MarangError {
  constructor(message: string, details?: unknown) {
    super("UNAUTHORIZED", 401, message, details);
  }
}

export class ForbiddenError extends MarangError {
  constructor(message: string, details?: unknown) {
    super("FORBIDDEN", 403, message, details);
  }
}

/** System errors. */
export class InternalError extends MarangError {
  constructor(message: string, details?: unknown) {
    super("INTERNAL_ERROR", 500, message, details);
  }
}
