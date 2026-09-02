import { NextResponse } from "next/server";
import { API_URL, setAuthCookies } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(`${API_URL}/accounts/user/google-login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || data.detail || "Google authentication failed" },
        { status: res.status }
      );
    }

    const accessToken = data.access_token || data.access;
    const refreshToken = data.refresh_token || data.refresh;

    if (accessToken) {
      await setAuthCookies(accessToken, refreshToken);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
