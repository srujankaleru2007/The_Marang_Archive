import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import type { FastifyInstance, FastifyServerOptions, FastifyBaseLogger } from "fastify";
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import type { MarangConfig } from "../shared/config.js";

import { errorHandlerPlugin } from "./plugins/error-handler.js";
import { healthRoutes } from "./routes/health.js";

export interface BuildServerOptions extends Omit<
  Partial<FastifyServerOptions>,
  "logger" | "loggerInstance"
> {
  config: MarangConfig;
  logger?: FastifyBaseLogger;
}

export function buildServer(options: BuildServerOptions): FastifyInstance {
  const { config, logger, ...fastifyOptions } = options;

  const app = Fastify({
    ...(logger ? { loggerInstance: logger } : { logger: true }),
    trustProxy: true,
    ...fastifyOptions,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.withTypeProvider<ZodTypeProvider>();

  void app.register(cors, {
    origin: config.corsOrigins.length > 0 ? config.corsOrigins : true,
    credentials: true,
  });

  void app.register(rateLimit, {
    global: true,
    max: config.rateLimit.public.max,
    timeWindow: config.rateLimit.public.windowMs,
  });

  void app.register(errorHandlerPlugin);

  void app.register(healthRoutes);

  return app;
}
