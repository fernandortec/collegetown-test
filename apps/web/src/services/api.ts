import { z } from "zod";
import { env } from "../env";

const errorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
  }),
});

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const apiBaseUrl = env.VITE_API_BASE_URL.replace(/\/+$/, "");

export async function getJson(path: string): Promise<unknown> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  const jsonData: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsedError = errorResponseSchema.safeParse(jsonData);
    const message = parsedError.success
      ? parsedError.data.error.message
      : `API request failed with status ${response.status}.`;

    throw new ApiError(message, response.status);
  }

  return jsonData;
}
