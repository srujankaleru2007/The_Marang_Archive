import type { FastifyInstance } from "fastify";
import { z } from "zod/v4";

const healthResponseSchema = z.object({
  data: z.object({
    status: z.literal("ok"),
  }),
});

export async function healthRoutes(app: FastifyInstance) {
  app.get(
    "/api/v1/health",
    {
      schema: {
        response: {
          200: healthResponseSchema,
        },
      },
    },
    async () => {
      return { data: { status: "ok" as const } };
    },
  );
}
