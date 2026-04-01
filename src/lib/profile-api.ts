import { AuthApiError, refreshSession } from "@/lib/auth-api";
import type {
  ApiEnvelope,
  CurrentUserProfile,
  UpdateCurrentUserProfilePayload,
} from "@/lib/profile-contract";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

async function requestProfile<TData>(
  path: string,
  options?: {
    method?: "GET" | "PATCH";
    payload?: unknown;
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
  });

  const result = (await response.json().catch(() => null)) as
    | ApiEnvelope<TData>
    | { message?: string }
    | null;

  if (!response.ok || !result || !("success" in result) || !result.success) {
    throw new AuthApiError(
      result?.message ?? "Unable to complete your profile request.",
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

async function getCurrentUserProfile() {
  return withRefreshOnUnauthorized(() =>
    requestProfile<CurrentUserProfile>("/auth/me")
  );
}

async function updateCurrentUserProfile(payload: UpdateCurrentUserProfilePayload) {
  return withRefreshOnUnauthorized(() =>
    requestProfile<CurrentUserProfile>("/auth/me", {
      method: "PATCH",
      payload,
    })
  );
}

export { getCurrentUserProfile, updateCurrentUserProfile };
export type { CurrentUserProfile, UpdateCurrentUserProfilePayload };
