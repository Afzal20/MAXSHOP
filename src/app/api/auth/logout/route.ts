import { NextResponse } from "next/server";
import { API_URL, clearAuthCookies, getRefreshToken } from "@/lib/auth";

export async function POST() {
  try {
    // Tell DRF to blacklist the refresh token if configured
    const refreshToken = await getRefreshToken();

    if (refreshToken) {
      await fetch(`${API_URL}/accounts/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
