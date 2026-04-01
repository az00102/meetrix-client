import "server-only";

import { cookies } from "next/headers";

import type { ApiEnvelope, CurrentUserProfile } from "@/lib/profile-contract";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

type ApiResult<T> = ApiEnvelope<T> | { message?: string } | null;
type ServerCurrentUserProfileResult = {
  profile: CurrentUserProfile | null;
  errorMessage: string | null;
  errorStatus: number | null;
};

function buildCookieHeader() {
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

    const name = entry.slice(0, separatorIndex);
    const value = entry.slice(separatorIndex + 1);

    cookiesMap.set(name, value);
  }

  for (const entry of setCookieHeaders) {
    const [cookiePair] = entry.split(";");
    const separatorIndex = cookiePair.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const name = cookiePair.slice(0, separatorIndex);
    const value = cookiePair.slice(separatorIndex + 1);

    cookiesMap.set(name, value);
  }

  return Array.from(cookiesMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

async function requestCurrentUserProfile(cookieHeader: string) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  const result = await parseApiResult<CurrentUserProfile>(response);

  if (!response.ok || !result || !("success" in result) || !result.success) {
    return {
      profile: null,
      errorMessage:
        result?.message ?? "Unable to load your profile right now.",
      errorStatus: response.status,
    } satisfies ServerCurrentUserProfileResult;
  }

  return {
    profile: result.data,
    errorMessage: null,
    errorStatus: null,
  } satisfies ServerCurrentUserProfileResult;
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

async function getServerCurrentUserProfile() {
  const cookieHeader = await buildCookieHeader();

  if (!cookieHeader) {
    return {
      profile: null,
      errorMessage: "Your session is no longer active. Log in again to continue.",
      errorStatus: 401,
    } satisfies ServerCurrentUserProfileResult;
  }

  const initialResult = await requestCurrentUserProfile(cookieHeader);

  if (initialResult.profile || initialResult.errorStatus !== 401) {
    return initialResult;
  }

  const refreshedCookieHeader = await refreshServerSession(cookieHeader);

  if (!refreshedCookieHeader) {
    return initialResult;
  }

  return requestCurrentUserProfile(refreshedCookieHeader);
}

export { getServerCurrentUserProfile };
