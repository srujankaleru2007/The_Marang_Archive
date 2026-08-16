import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyError, type FastifyRequest } from "fastify";
import { hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import type { AppConfig } from "../shared/config.js";
import { MarangError } from "../shared/errors.js";
import { logger } from "../shared/logger.js";

import { healthRoutes } from "./routes/health.js";

export function buildServer(config: AppConfig) {
  const server = Fastify({ loggerInstance: logger, requestIdHeader: "x-request-id" });
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  server.addHook("onRequest", async (request: FastifyRequest) => {
    request.log = request.log.child({ requestId: request.id, module: "api" });
  });

  server.addHook("onSend", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });

  server.setErrorHandler((error: FastifyError | MarangError, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      request.log.warn({ err: error }, "Request validation failed");
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: "Request validation failed", details: error.validation },
      });
    }

    if (error instanceof MarangError) {
      request.log.warn({ code: error.code }, error.message);
      return reply.status(error.statusCode).send({
        error: { code: error.code, message: error.message, ...(error.details === undefined ? {} : { details: error.details }) },
      });
    }

    request.log.error({ err: error }, "Unhandled request error");
    return reply.status(500).send({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } });
  });

  void server.register(cors, { origin: config.corsOrigin });
  void server.register(rateLimit, {
    max: config.rateLimit.publicMax,
    timeWindow: config.rateLimit.publicWindowMs,
  });
  void server.register(healthRoutes, { prefix: "/api/v1" });

  return server;
}
