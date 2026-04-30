import type { Hono } from "hono";
import { cors } from "hono/cors";
import { registerSchoolRoutes } from "../modules/school/school.routes";
import { registerHealthRoutes } from "./health.routes";
import type { ErrorResponse } from "./responses";

const FRONTEND_ORIGINS = ["http://localhost:5173"];

export function registerHttp(app: Hono): void {
  app.use(
    "*",
    cors({
      origin: FRONTEND_ORIGINS,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "OPTIONS"],
    }),
  );

  registerHealthRoutes(app);
  registerSchoolRoutes(app);

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
}
