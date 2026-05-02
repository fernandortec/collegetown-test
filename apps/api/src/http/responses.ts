import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export function jsonError(
  c: Context,
  status: ContentfulStatusCode,
  error: ErrorResponse["error"],
) {
  return c.json<ErrorResponse>({ error }, status);
}
