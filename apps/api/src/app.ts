import { Hono } from "hono";
import { cors } from "hono/cors";

const FRONTEND_ORIGIN = "http://localhost:5173";

export type HealthResponse = {
  ok: true;
  service: "better-vping-api";
};

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export function createApp(): Hono {
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: FRONTEND_ORIGIN,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "OPTIONS"],
    }),
  );

  app.get("/api/health", (c) =>
    c.json<HealthResponse>({ ok: true, service: "better-vping-api" }),
  );

  app.notFound((c) =>
    c.json<ErrorResponse>(
      {
        error: {
          code: "NOT_FOUND",
          message: "Route not found.",
        },
      },
      404,
    ),
  );

  return app;
}
