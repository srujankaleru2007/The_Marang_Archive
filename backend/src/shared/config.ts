import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

const LOG_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(LOG_LEVELS).optional(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default("30d"),
  ARGON2_PEPPER: z.string().optional(),
  CORS_ORIGIN: z.string().default(""),
  RATE_LIMIT_PUBLIC_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_PUBLIC_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_AUTH_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  UPDATE_CHECK_CRON: z.string().min(1).default("*/30 * * * *"),
  HEALTH_CHECK_CRON: z.string().min(1).default("*/10 * * * *"),
});

export type ParsedEnv = z.infer<typeof envSchema>;

export interface MarangConfig {
  env: "development" | "test" | "production";
  host: string;
  port: number;
  logLevel: LogLevel;
  databaseUrl: string;
  redisUrl: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
    argon2Pepper?: string;
  };
  corsOrigins: string[];
  rateLimit: {
    public: { max: number; windowMs: number };
    auth: { max: number; windowMs: number };
  };
  jobs: {
    updateCheckCron: string;
    healthCheckCron: string;
  };
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
    Error.captureStackTrace?.(this, ConfigError);
  }
}

/**
 * Validate the provided environment and return a typed configuration.
 *
 * Throws a `ConfigError` listing every missing/invalid variable so startup
 * failures are actionable.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): MarangConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new ConfigError(`Invalid environment configuration:\n${issues}`);
  }

  const raw = parsed.data;
  const logLevel = raw.LOG_LEVEL ?? (raw.NODE_ENV === "production" ? "info" : "debug");

  const jwt: MarangConfig["jwt"] = {
    accessSecret: raw.JWT_ACCESS_SECRET,
    refreshSecret: raw.JWT_REFRESH_SECRET,
    accessExpiresIn: raw.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: raw.JWT_REFRESH_EXPIRES_IN,
  };
  if (raw.ARGON2_PEPPER !== undefined) {
    jwt.argon2Pepper = raw.ARGON2_PEPPER;
  }

  return {
    env: raw.NODE_ENV,
    host: raw.HOST,
    port: raw.PORT,
    logLevel,
    databaseUrl: raw.DATABASE_URL,
    redisUrl: raw.REDIS_URL,
    jwt,
    corsOrigins: raw.CORS_ORIGIN.split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
    rateLimit: {
      public: { max: raw.RATE_LIMIT_PUBLIC_MAX, windowMs: raw.RATE_LIMIT_PUBLIC_WINDOW_MS },
      auth: { max: raw.RATE_LIMIT_AUTH_MAX, windowMs: raw.RATE_LIMIT_AUTH_WINDOW_MS },
    },
    jobs: {
      updateCheckCron: raw.UPDATE_CHECK_CRON,
      healthCheckCron: raw.HEALTH_CHECK_CRON,
    },
  };
}

const currentDir = dirname(fileURLToPath(import.meta.url));
export const dotenvPath = resolve(currentDir, "../../../.env");
export { currentDir };
