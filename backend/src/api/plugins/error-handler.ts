import type { FastifyInstance, FastifyError } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";

import { MarangError, ValidationError, InternalError, NotFoundError } from "../../shared/errors.js";

interface EnvelopeError {
  code: string;
  message: string;
  details?: unknown;
}

function toEnvelope(error: FastifyError): {
  statusCode: number;
  payload: { error: EnvelopeError };
} {
  if (error instanceof MarangError) {
    return {
      statusCode: error.statusCode,
      payload: {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
      },
    };
  }

  if (hasZodFastifySchemaValidationErrors(error)) {
    const details = error.validation.map(({ instancePath, message }) => ({
      path: instancePath || "/",
      message: message || "Invalid value",
    }));
    const validationError = new ValidationError("Invalid request payload.", details);
    return {
      statusCode: 400,
      payload: {
        error: {
          code: validationError.code,
          message: validationError.message,
          details: validationError.details,
        },
      },
    };
  }

  if (error.validation) {
    const validationError = new ValidationError("Invalid request payload.", {
      context: error.validationContext,
      validation: error.validation,
    });
    return {
      statusCode: 400,
      payload: {
        error: {
          code: validationError.code,
          message: validationError.message,
          details: validationError.details,
        },
      },
    };
  }

  const internalError = new InternalError("An unexpected error occurred.");
  return {
    statusCode: 500,
    payload: { error: { code: internalError.code, message: internalError.message } },
  };
}

export async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const { statusCode, payload } = toEnvelope(error);

    if (error instanceof MarangError) {
      if (error.statusCode >= 500) {
        request.log.error({ err: error }, error.message);
      } else {
        request.log.warn({ err: error }, error.message);
      }
    } else if (hasZodFastifySchemaValidationErrors(error) || error.validation) {
      request.log.warn({ err: error }, "Request validation failed");
    } else {
      request.log.error({ err: error }, "Unhandled error");
    }

    return reply.status(statusCode).send(payload);
  });

  app.setNotFoundHandler((_request, reply) => {
    const notFound = new NotFoundError("Route not found.");
    return reply.status(notFound.statusCode).send({
      error: { code: notFound.code, message: notFound.message },
    });
  });
}
