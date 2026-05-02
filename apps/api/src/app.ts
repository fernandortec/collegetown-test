import { Hono } from "hono";

import { cors } from "hono/cors";

import { jsonError } from "./http/responses";
import { registerSchoolRoutes } from "./modules/school/school.routes";

const FRONTEND_ORIGINS = ["http://localhost:5173"];

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: FRONTEND_ORIGINS,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.get("/api/health", (c) =>
  c.json({ ok: true, service: "better-vping-api" }),
);

registerSchoolRoutes(app);

app.notFound((c) =>
  jsonError(c, 404, {
    code: "NOT_FOUND",
    message: "Route not found.",
  }),
);
