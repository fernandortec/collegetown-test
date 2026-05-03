import { z } from "zod";
import { env } from "../env";

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string().optional(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown API error.";
}

const apiBaseUrl = env.VITE_API_BASE_URL.replace(/\/+$/, "");

export async function getJson(path: string): Promise<unknown> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  let jsonData: unknown;

  try {
    jsonData = await response.json();
  } catch (error) {
    throw new ApiError(
      response.ok
        ? "Response body was not valid JSON."
        : `API request failed with status ${response.status}; response body was not valid JSON.`,
      response.status,
      "INVALID_JSON_RESPONSE",
      error instanceof Error ? { cause: error.message } : undefined,
    );
  }

  if (!response.ok) {
    const parsedError = errorResponseSchema.safeParse(jsonData);
    const message = parsedError.success
      ? parsedError.data.error.message
      : `API request failed with status ${response.status}.`;

    throw new ApiError(
      message,
      response.status,
      parsedError.success ? parsedError.data.error.code : undefined,
      parsedError.success ? parsedError.data.error.details : undefined,
    );
  }

  return jsonData;
}
