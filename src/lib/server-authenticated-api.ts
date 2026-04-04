import "server-only";

import { cookies } from "next/headers";

import type { ApiEnvelope } from "@/lib/api-contract";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

type ServerAuthenticatedResult<TData> = {
  data: TData | null;
  meta: Record<string, unknown> | null;
  errorMessage: string | null;
  errorStatus: number | null;
};

type ApiResult<T> = ApiEnvelope<T> | { message?: string } | null;

async function buildCookieHeader() {
  return cookies()
    .then((cookieStore) =>
      cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${encodeURIComponent(cookie.value)}`)
        .join("; ")
    )
    .catch(() => "");
}

async function parseApiResult<T>(response: Response) {
  return (await response.json().catch(() => null)) as ApiResult<T>;
}

function getSetCookieHeaders(response: Response) {
  const responseHeaders = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof responseHeaders.getSetCookie === "function") {
    return responseHeaders.getSetCookie();
  }

  const singleHeader = response.headers.get("set-cookie");
  return singleHeader ? [singleHeader] : [];
}

function mergeCookieHeaders(cookieHeader: string, setCookieHeaders: string[]) {
  const cookiesMap = new Map<string, string>();

  for (const entry of cookieHeader.split(/;\s*/).filter(Boolean)) {
    const separatorIndex = entry.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    cookiesMap.set(
      entry.slice(0, separatorIndex),
      entry.slice(separatorIndex + 1)
    );
  }

  for (const entry of setCookieHeaders) {
    const [cookiePair] = entry.split(";");
    const separatorIndex = cookiePair.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    cookiesMap.set(
      cookiePair.slice(0, separatorIndex),
      cookiePair.slice(separatorIndex + 1)
    );
  }

  return Array.from(cookiesMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

async function requestServerAuthenticatedOnce<TData>(
  path: string,
  cookieHeader: string,
  options?: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    payload?: unknown;
  }
): Promise<ServerAuthenticatedResult<TData>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options?.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body:
        options?.payload === undefined ? undefined : JSON.stringify(options.payload),
      cache: "no-store",
    });

    const result = await parseApiResult<TData>(response);

    if (!response.ok || !result || !("success" in result) || !result.success) {
      return {
        data: null,
        meta: null,
        errorMessage:
          result?.message ?? "Unable to load dashboard data right now.",
        errorStatus: response.status,
      };
    }

    return {
      data: result.data,
      meta: result.meta ?? null,
      errorMessage: null,
      errorStatus: null,
    };
  } catch {
    return {
      data: null,
      meta: null,
      errorMessage: "The dashboard service is currently unavailable.",
      errorStatus: null,
    };
  }
}

async function refreshServerSession(cookieHeader: string) {
  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  const result = await parseApiResult<unknown>(response);

  if (!response.ok || !result || !("success" in result) || !result.success) {
    return null;
  }

  const refreshedCookieHeader = mergeCookieHeaders(
    cookieHeader,
    getSetCookieHeaders(response)
  );

  return refreshedCookieHeader || null;
}

async function requestServerAuthenticated<TData>(
  path: string,
  options?: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    payload?: unknown;
  }
) {
  const cookieHeader = await buildCookieHeader();

  if (!cookieHeader) {
    return {
      data: null,
      meta: null,
      errorMessage: "Your session is no longer active. Log in again to continue.",
      errorStatus: 401,
    } satisfies ServerAuthenticatedResult<TData>;
  }

  const initialResult = await requestServerAuthenticatedOnce<TData>(
    path,
    cookieHeader,
    options
  );

  if (initialResult.data || initialResult.errorStatus !== 401) {
    return initialResult;
  }

  const refreshedCookieHeader = await refreshServerSession(cookieHeader);

  if (!refreshedCookieHeader) {
    return initialResult;
  }

  return requestServerAuthenticatedOnce<TData>(
    path,
    refreshedCookieHeader,
    options
  );
}

export { requestServerAuthenticated };
export type { ServerAuthenticatedResult };
