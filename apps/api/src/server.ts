import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { env } from "@pump-terminal/config";
import {
  addPaperOrder,
  getSummary,
  getToken,
  listTokens
} from "@pump-terminal/store";

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: true
});

app.get(
  "/api/health",
  async () => ({
    ok: true,
    service: "api",
    timestamp: Date.now()
  })
);

app.get(
  "/api/metrics",
  async () => getSummary()
);

app.get<{
  Querystring: {
    limit?: string;
  };
}>(
  "/api/tokens/new",
  async (request) => {
    const limit = Number(
      request.query.limit ?? 50
    );

    return {
      data: await listTokens(
        "new",
        Number.isFinite(limit) ? limit : 50
      )
    };
  }
);

app.get<{
  Querystring: {
    limit?: string;
  };
}>(
  "/api/tokens/trending",
  async (request) => {
    const limit = Number(
      request.query.limit ?? 50
    );

    return {
      data: await listTokens(
        "trending",
        Number.isFinite(limit) ? limit : 50
      )
    };
  }
);

app.get<{
  Params: {
    mint: string;
  };
}>(
  "/api/tokens/:mint",
  async (request, reply) => {
    const result = await getToken(
      request.params.mint
    );

    if (!result) {
      return reply
        .code(404)
        .send({
          error: "Token not found"
        });
    }

    return result;
  }
);

const paperOrderSchema = z.object({
  mint: z.string().min(1),
  side: z.enum(["buy", "sell"]),
  solAmount: z.number().positive().max(100)
});

app.post(
  "/api/paper/orders",
  async (request, reply) => {
    const parsed = paperOrderSchema.safeParse(
      request.body
    );

    if (!parsed.success) {
      return reply
        .code(400)
        .send({
          error: parsed.error.flatten()
        });
    }

    const token = await getToken(
      parsed.data.mint
    );

    if (!token) {
      return reply
        .code(404)
        .send({
          error: "Token not found"
        });
    }

    return reply
      .code(201)
      .send({
        data: await addPaperOrder(
          parsed.data
        )
      });
  }
);

app.setErrorHandler(
  (error, _request, reply) => {
    app.log.error(error);

    return reply
      .code(500)
      .send({
        error: "Internal server error"
      });
  }
);

await app.listen({
  port: env.API_PORT,
  host: "0.0.0.0"
});
