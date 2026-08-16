import pino, { type Logger } from "pino";

import type { MarangConfig } from "./config.js";

/**
 * Create the application logger.
 *
 * Uses JSON output in production (structured logs for the host), and a
 * pretty-printed, human-friendly stream in development/test.
 */
export function createLogger(config: MarangConfig): Logger {
  const options = {
    level: config.logLevel,
    base: { service: "marang-backend" },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (config.env === "production") {
    return pino(options);
  }

  return pino(
    options,
    pino.transport({
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:standard" },
    }),
  );
}
