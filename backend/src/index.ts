import "dotenv/config";
import { buildServer } from "./api/server.js";
import { loadConfig, ConfigError } from "./shared/config.js";
import { createLogger } from "./shared/logger.js";

async function main(): Promise<void> {
  let config;
  try {
    config = loadConfig();
  } catch (error) {
    if (error instanceof ConfigError) {
      // eslint-disable-next-line no-console
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }

  const logger = createLogger(config);
  const server = buildServer({ config, logger });

  try {
    await server.listen({ host: config.host, port: config.port });
  } catch (error) {
    server.log.error({ err: error }, "Server failed to start.");
    process.exit(1);
  }
}

void main();
