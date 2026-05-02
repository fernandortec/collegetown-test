import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type ErrorResponse = {
  error: {
    message: string;
  };
};

export function jsonError(
  c: Context,
  status: ContentfulStatusCode,
  error: ErrorResponse["error"],
) {
  return c.json<ErrorResponse>({ error }, status);
}
