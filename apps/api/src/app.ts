import { Hono } from "hono";
import { registerHttp } from "./http";

export function createApp(): Hono {
  const app = new Hono();
  registerHttp(app);

  return app;
}
