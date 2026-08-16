import { describe, expect, it } from "vitest";

import { loadConfig, ConfigError } from "./config.js";

const VALID_ENV = {
  NODE_ENV: "test",
  PORT: "4000",
  DATABASE_URL: "postgres://localhost/marang",
  REDIS_URL: "redis://localhost:6379",
  JWT_ACCESS_SECRET: "x".repeat(64),
  JWT_REFRESH_SECRET: "y".repeat(64),
};

describe("loadConfig", () => {
  it("loads a valid environment with defaults applied", () => {
    const config = loadConfig({ ...VALID_ENV });

    expect(config.env).toBe("test");
    expect(config.host).toBe("0.0.0.0");
    expect(config.port).toBe(4000);
    expect(config.logLevel).toBe("debug");
    expect(config.corsOrigins).toEqual([]);
    expect(config.rateLimit.public).toEqual({ max: 30, windowMs: 60000 });
    expect(config.rateLimit.auth).toEqual({ max: 120, windowMs: 60000 });
    expect(config.jwt.accessExpiresIn).toBe("15m");
    expect(config.jwt.refreshExpiresIn).toBe("30d");
  });

  it("uses info log level in production", () => {
    const config = loadConfig({ ...VALID_ENV, NODE_ENV: "production" });
    expect(config.logLevel).toBe("info");
  });

  it("parses CORS_ORIGIN into a trimmed list", () => {
    const config = loadConfig({
      ...VALID_ENV,
      CORS_ORIGIN: "https://a.example.com, https://b.example.com ,",
    });
    expect(config.corsOrigins).toEqual(["https://a.example.com", "https://b.example.com"]);
  });

  it("throws ConfigError listing every missing required variable", () => {
    expect(() => loadConfig({})).toThrow(ConfigError);
    expect(() => loadConfig({ NODE_ENV: "test" })).toThrowError(/DATABASE_URL/);
    try {
      loadConfig({});
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError);
      const message = (error as ConfigError).message;
      expect(message).toMatch(/DATABASE_URL/);
      expect(message).toMatch(/REDIS_URL/);
      expect(message).toMatch(/JWT_ACCESS_SECRET/);
      expect(message).toMatch(/JWT_REFRESH_SECRET/);
    }
  });

  it("throws ConfigError when JWT secrets are too short", () => {
    expect(() => loadConfig({ ...VALID_ENV, JWT_ACCESS_SECRET: "short" })).toThrowError(
      /JWT_ACCESS_SECRET/,
    );
  });
});
