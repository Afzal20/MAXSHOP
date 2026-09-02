import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function POST() {
  try {
    // Optionally tell DRF to blacklist the refresh token if configured
    const refreshToken = (await cookies()).get("refresh_token")?.value;

    if (refreshToken) {
      await fetch(`${API_URL}/accounts/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }

    // Clear the cookies in the browser
    (await cookies()).delete("access_token");
    (await cookies()).delete("refresh_token");

    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong during logout." },
      { status: 500 }
    );
  }
}
