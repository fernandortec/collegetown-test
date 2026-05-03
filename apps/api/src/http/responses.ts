import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ErrorResponse } from "../@types/types";

export function jsonError(
  c: Context,
  status: ContentfulStatusCode,
  error: ErrorResponse["error"],
) {
  return c.json<ErrorResponse>({ error }, status);
}
