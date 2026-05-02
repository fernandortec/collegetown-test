import { serve } from "@hono/node-server";
import { env } from "./env";
import { app } from "./app";

serve({
  fetch: app.fetch,
  port: env.PORT,
});
