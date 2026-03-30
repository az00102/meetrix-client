const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";
const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const SESSION_TOKEN_COOKIE = "better-auth.session_token";

type AuthApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type BackendUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  status: string;
  isDeleted: boolean;
};

type BackendSession = {
  id: string;
  userId: string;
  expiresAt: string;
  token: string;
};

type AuthPayload = {
  user: BackendUser;
  session: BackendSession;
  token: string;
  accessToken: string;
  refreshToken: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RefreshPayload = {
  newAccessToken: string;
  newRefreshToken: string;
  sessionToken: string;
};

class AuthApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

function setClientCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function clearClientCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function persistAuthCookies(payload: AuthPayload) {
  setClientCookie(ACCESS_TOKEN_COOKIE, payload.accessToken, 60 * 60 * 24);
  setClientCookie(REFRESH_TOKEN_COOKIE, payload.refreshToken, 60 * 60 * 24 * 7);
  setClientCookie(SESSION_TOKEN_COOKIE, payload.token, 60 * 60 * 24);
}

function persistRefreshedCookies(payload: RefreshPayload) {
  setClientCookie(ACCESS_TOKEN_COOKIE, payload.newAccessToken, 60 * 60 * 24);
  setClientCookie(REFRESH_TOKEN_COOKIE, payload.newRefreshToken, 60 * 60 * 24 * 7);
  setClientCookie(SESSION_TOKEN_COOKIE, payload.sessionToken, 60 * 60 * 24);
}

function clearAuthCookies() {
  clearClientCookie(ACCESS_TOKEN_COOKIE);
  clearClientCookie(REFRESH_TOKEN_COOKIE);
  clearClientCookie(SESSION_TOKEN_COOKIE);
}

async function requestAuth<TPayload>(
  path: string,
  options?: {
    method?: "POST";
    payload?: TPayload;
  }
): Promise<AuthApiEnvelope<AuthPayload | RefreshPayload | null>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options?.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body:
      options?.payload === undefined ? undefined : JSON.stringify(options.payload),
  });

  const result = (await response.json().catch(() => null)) as
    | AuthApiEnvelope<AuthPayload | RefreshPayload | null>
    | { message?: string }
    | null;

  if (!response.ok || !result || !("success" in result) || !result.success) {
    throw new AuthApiError(
      result?.message ?? "Authentication request failed.",
      response.status
    );
  }

  return result;
}

async function registerUser(payload: RegisterPayload) {
  const result = await requestAuth("/auth/register", { payload });

  if (result.data && "token" in result.data) {
    persistAuthCookies(result.data);
  }

  return result;
}

async function loginUser(payload: LoginPayload) {
  const result = await requestAuth("/auth/login", { payload });

  if (result.data && "token" in result.data) {
    persistAuthCookies(result.data);
  }

  return result;
}

async function refreshSession() {
  try {
    const result = await requestAuth("/auth/refresh-token");

    if (result.data && "sessionToken" in result.data) {
      persistRefreshedCookies(result.data);
    }

    return result;
  } catch (error) {
    clearAuthCookies();
    throw error;
  }
}

async function logoutUser() {
  try {
    const result = await requestAuth("/auth/logout");
    clearAuthCookies();
    return result;
  } catch (error) {
    clearAuthCookies();

    if (error instanceof AuthApiError && error.status === 401) {
      return {
        success: true,
        message: "Session already expired.",
        data: null,
      };
    }

    throw error;
  }
}

export { AuthApiError, loginUser, logoutUser, refreshSession, registerUser };
