import { AuthApiError, refreshSession } from "@/lib/auth-api";
import type { ApiEnvelope } from "@/lib/api-contract";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

type QueryValue = string | number | null | undefined;

async function requestAuthenticated<TData>(
  path: string,
  options?: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    payload?: unknown;
    signal?: AbortSignal;
  }
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body:
      options?.payload === undefined ? undefined : JSON.stringify(options.payload),
    signal: options?.signal,
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as
    | ApiEnvelope<TData>
    | { message?: string }
    | null;

  if (!response.ok || !result || !("success" in result) || !result.success) {
    throw new AuthApiError(
      result?.message ?? "Unable to complete this request right now.",
      response.status
    );
  }

  return result;
}

async function withRefreshOnUnauthorized<TData>(
  request: () => Promise<ApiEnvelope<TData>>
) {
  try {
    return await request();
  } catch (error) {
    if (!(error instanceof AuthApiError) || error.status !== 401) {
      throw error;
    }

    await refreshSession();
    return request();
  }
}

function buildAuthenticatedQueryString(
  query: Record<string, QueryValue | QueryValue[]>
) {
  const searchParams = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(query)) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];

    for (const value of values) {
      if (value === undefined || value === null || value === "") {
        continue;
      }

      searchParams.append(key, String(value));
    }
  }

  const result = searchParams.toString();
  return result ? `?${result}` : "";
}

export {
  buildAuthenticatedQueryString,
  requestAuthenticated,
  withRefreshOnUnauthorized,
};
