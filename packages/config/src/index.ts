import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  API_PORT: z.coerce.number().int().positive().default(4000),

  API_URL: z.string().url().default("http://localhost:4000"),

  DATA_FILE: z.string().default("./data/market.json"),

  BOT_TOKEN: z.string().optional(),

  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .default("http://localhost:4000")
});

export const env = schema.parse(process.env);
