import type { FastifyInstance } from "fastify";
import { pino } from "pino";
import { describe, expect, it, afterEach } from "vitest";

import type { MarangConfig } from "../shared/config.js";

import { buildServer } from "./server.js";

function testConfig(overrides: Partial<MarangConfig> = {}): MarangConfig {
  return {
    env: "test",
    host: "127.0.0.1",
    port: 0,
    logLevel: "silent",
    databaseUrl: "postgres://localhost/marang",
    redisUrl: "redis://localhost:6379",
    jwt: {
      accessSecret: "a".repeat(64),
      refreshSecret: "b".repeat(64),
      accessExpiresIn: "15m",
      refreshExpiresIn: "30d",
    },
    corsOrigins: [],
    rateLimit: {
      public: { max: 30, windowMs: 60000 },
      auth: { max: 120, windowMs: 60000 },
    },
    jobs: {
      updateCheckCron: "*/30 * * * *",
      healthCheckCron: "*/10 * * * *",
    },
    ...overrides,
  };
}

const servers: FastifyInstance[] = [];

async function makeServer(overrides: Partial<MarangConfig> = {}) {
  const app = buildServer({ config: testConfig(overrides), logger: pino({ level: "silent" }) });
  await app.ready();
  servers.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((s) => s.close()));
});

describe("health route", () => {
  it("returns 200 with the success envelope", async () => {
    const app = await makeServer();
    const response = await app.inject({ method: "GET", url: "/api/v1/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: { status: "ok" } });
  });
});

describe("error envelope", () => {
  it("returns the error envelope for an unknown route", async () => {
    const app = await makeServer();
    const response = await app.inject({ method: "GET", url: "/api/v1/nope" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: { code: "NOT_FOUND", message: "Route not found." },
    });
  });
});
