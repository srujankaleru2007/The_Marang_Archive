import { buildServer } from "./api/server.js";
import { loadConfig } from "./shared/config.js";
import { logger } from "./shared/logger.js";

const config = loadConfig();
const server = buildServer(config);

try {
  await server.listen({ port: config.port, host: "0.0.0.0" });
} catch (error) {
  logger.error({ err: error, module: "startup" }, "Failed to start server");
  process.exitCode = 1;
}
