import type { Hono } from "hono";

export function registerHealthRoutes(app: Hono): void {
  app.get("/api/health", (c) =>
    c.json({ ok: true, service: "better-vping-api" }),
  );
}
