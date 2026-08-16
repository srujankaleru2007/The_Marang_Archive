export class MarangError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  public constructor(code: string, message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "MarangError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends MarangError {
  public constructor(message = "Request validation failed", details?: unknown) {
    super("VALIDATION_ERROR", message, 400, details);
  }
}

export class UnauthorizedError extends MarangError {
  public constructor(message = "Authentication is required") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ForbiddenError extends MarangError {
  public constructor(message = "You do not have permission to perform this action") {
    super("FORBIDDEN", message, 403);
  }
}

export class ConflictError extends MarangError {
  public constructor(message = "The request conflicts with existing data") {
    super("CONFLICT", message, 409);
  }
}

export class InternalError extends MarangError {
  public constructor(message = "An unexpected error occurred") {
    super("INTERNAL_ERROR", message, 500);
  }
}

export class SourceUnavailableError extends MarangError {
  public constructor(message = "A connected source is unavailable") {
    super("SOURCE_UNAVAILABLE", message, 503);
  }
}

export class SourceTimeoutError extends MarangError {
  public constructor(message = "A connected source timed out") {
    super("SOURCE_TIMEOUT", message, 504);
  }
}
