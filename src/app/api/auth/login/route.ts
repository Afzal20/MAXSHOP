import { NextResponse } from "next/server";
import { API_URL, setAuthCookies } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Call the DRF Login endpoint
    const response = await fetch(`${API_URL}/accounts/user/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // DRF SimpleJWT returns { access_token, refresh_token } (and optionally { access, refresh })
    const accessToken = data.access_token || data.access;
    const refreshToken = data.refresh_token || data.refresh;

    if (accessToken) {
      await setAuthCookies(accessToken, refreshToken);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong during login." },
      { status: 500 }
    );
  }
}
