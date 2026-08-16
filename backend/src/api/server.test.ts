import { describe, expect, it } from "vitest";

import { loadConfig } from "../shared/config.js";
import { MarangError } from "../shared/errors.js";

import { buildServer } from "./server.js";

describe("API server", () => {
  it("returns the health response with a request ID", async () => {
    const server = buildServer(loadConfig({ NODE_ENV: "test" }));
    const response = await server.inject({ method: "GET", url: "/api/v1/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ data: { status: "ok" } });
    expect(response.headers["x-request-id"]).toBeDefined();
    await server.close();
  });

  it("maps MarangError instances to the API error envelope", async () => {
    const server = buildServer(loadConfig({ NODE_ENV: "test" }));
    server.get("/api/v1/test-error", async () => {
      throw new MarangError("TEST_ERROR", "A test error", 418);
    });

    const response = await server.inject({ method: "GET", url: "/api/v1/test-error" });

    expect(response.statusCode).toBe(418);
    expect(response.json()).toEqual({ error: { code: "TEST_ERROR", message: "A test error" } });
    await server.close();
  });
});
