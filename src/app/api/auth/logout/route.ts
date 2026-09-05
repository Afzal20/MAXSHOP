import { NextResponse } from "next/server";
import { API_URL, clearAuthCookies, getAccessToken, getRefreshToken } from "@/lib/auth";

export async function POST() {
  try {
    // Tell DRF to blacklist the refresh token
    const refreshToken = await getRefreshToken();
    const accessToken = await getAccessToken();

    if (refreshToken) {
      const cookieHeader = [
        `refresh_token=${refreshToken}`,
        accessToken ? `access_token=${accessToken}` : "",
      ]
        .filter(Boolean)
        .join("; ");

      await fetch(`${API_URL}/accounts/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }

    // Clear the HTTP-only cookies in the browser
    await clearAuthCookies();

    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong during logout." },
      { status: 500 }
    );
  }
}
