import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CORS_ORIGIN: z.string().default("http://localhost:8081"),
  RATE_LIMIT_PUBLIC_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_PUBLIC_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_AUTH_WINDOW_MS: z.coerce.number().int().positive().default(60000),
});

export type AppConfig = {
  nodeEnv: "development" | "test" | "production";
  port: number;
  corsOrigin: string | string[];
  rateLimit: {
    publicMax: number;
    publicWindowMs: number;
    authMax: number;
    authWindowMs: number;
  };
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = configSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new Error(`Invalid application configuration: ${issues}`);
  }

  const corsOrigin = parsed.data.CORS_ORIGIN
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    nodeEnv: parsed.data.NODE_ENV,
    port: parsed.data.PORT,
    corsOrigin: corsOrigin.length === 1 ? corsOrigin[0] : corsOrigin,
    rateLimit: {
      publicMax: parsed.data.RATE_LIMIT_PUBLIC_MAX,
      publicWindowMs: parsed.data.RATE_LIMIT_PUBLIC_WINDOW_MS,
      authMax: parsed.data.RATE_LIMIT_AUTH_MAX,
      authWindowMs: parsed.data.RATE_LIMIT_AUTH_WINDOW_MS,
    },
  };
}
