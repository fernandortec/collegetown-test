import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number(),
  GOOGLE_AI_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);