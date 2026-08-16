import { describe, expect, it } from "vitest";

import { loadConfig } from "./config.js";

describe("loadConfig", () => {
  it("loads defaults and parses comma-separated CORS origins", () => {
    const config = loadConfig({ CORS_ORIGIN: "http://localhost:8081, http://localhost:19006" });
    expect(config.port).toBe(3000);
    expect(config.corsOrigin).toEqual(["http://localhost:8081", "http://localhost:19006"]);
  });

  it("rejects invalid configuration", () => {
    expect(() => loadConfig({ PORT: "not-a-port" })).toThrow("Invalid application configuration");
  });
});
