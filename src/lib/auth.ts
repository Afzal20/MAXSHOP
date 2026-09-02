import { cookies } from "next/headers";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

// Keep these in sync with the backend's SIMPLE_JWT settings.
export const ACCESS_MAX_AGE = 60 * 15; // 15 minutes
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, { ...cookieOptions, maxAge: ACCESS_MAX_AGE });
  if (refreshToken) {
    store.set(REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: REFRESH_MAX_AGE });
  }
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

/**
 * Exchange the refresh cookie for a fresh access token (and rotated refresh token).
 * The backend rotates + blacklists refresh tokens, so we always persist the new one.
 */
export async function refreshAuthTokens(): Promise<{
  access: string;
  refresh: string;
} | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/accounts/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${REFRESH_COOKIE}=${refreshToken}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = await res.json();
    const access = data.access_token || data.access;
    const refresh = data.new_refresh_token || data.refresh || refreshToken;
    if (!access) return null;

    return { access, refresh };
  } catch {
    return null;
  }
}

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
}

/**
 * Server-side fetch against the Django API with the access_token cookie attached.
 * On 401/403 it attempts to refresh the access token once and retries the request.
 * If the refresh fails the response is normalized to 401 so the UI can prompt sign-in.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit & { body?: BodyInit } = {}
): Promise<ApiResult<T>> {
  let accessToken = await getAccessToken();
  if (!accessToken) {
    return { ok: false, status: 401, data: null };
  }

  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };

  const doFetch = (token: string) =>
    fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...baseHeaders, Cookie: `${ACCESS_COOKIE}=${token}` },
      cache: "no-store",
    });

  let res = await doFetch(accessToken);

  if ((res.status === 401 || res.status === 403) && (await getRefreshToken())) {
    const refreshed = await refreshAuthTokens();
    if (refreshed) {
      await setAuthCookies(refreshed.access, refreshed.refresh);
      res = await doFetch(refreshed.access);
    } else {
      await clearAuthCookies();
      return { ok: false, status: 401, data: null };
    }
  }

  let data: T | null = null;
  try {
    data = (await res.json()) as T;
  } catch {
    // 204 / non-JSON responses leave data as null
  }

  return { ok: res.ok, status: res.status, data };
}
