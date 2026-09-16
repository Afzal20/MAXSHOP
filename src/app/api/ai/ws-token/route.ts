import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  getAccessToken,
  getRefreshToken,
  refreshAuthTokens,
  setAuthCookies,
} from "@/lib/auth";

/**
 * Returns a short-lived access token for the AI WebSocket handshake.
 *
 * The auth cookies are httpOnly and scoped to this Next.js origin, so the
 * browser cannot attach them when opening a WebSocket directly to the Django
 * API (a different host). This route exposes a fresh token to the authenticated
 * client instead; the token is a short-lived JWT (15 min) and the socket only
 * lives for the chat session.
 */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf-8")
    );
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export async function GET() {
  let accessToken = await getAccessToken();

  if (!accessToken) {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const refreshed = await refreshAuthTokens();
    if (refreshed) {
      await setAuthCookies(refreshed.access, refreshed.refresh);
      accessToken = refreshed.access;
    } else {
      return NextResponse.json(
        { error: "Session expired. Please sign in again." },
        { status: 401 }
      );
    }
  } else {
    // If access token is present, check expiry
    const expiry = getTokenExpiry(accessToken);
    const isExpired = expiry !== null && expiry * 1000 <= Date.now();
    const aboutToExpire = isExpired || (expiry !== null && expiry * 1000 - Date.now() < 30_000);

    if (aboutToExpire && (await getRefreshToken())) {
      const refreshed = await refreshAuthTokens();
      if (refreshed) {
        await setAuthCookies(refreshed.access, refreshed.refresh);
        accessToken = refreshed.access;
      } else if (isExpired) {
        return NextResponse.json(
          { error: "Session expired. Please sign in again." },
          { status: 401 }
        );
      }
    } else if (isExpired) {
      return NextResponse.json(
        { error: "Session expired. Please sign in again." },
        { status: 401 }
      );
    }
  }

  return NextResponse.json({ token: accessToken, cookieName: ACCESS_COOKIE });
}
