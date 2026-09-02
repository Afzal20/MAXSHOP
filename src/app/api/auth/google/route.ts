import { NextResponse } from "next/server";
import { API_URL } from "@/lib/constants";

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

    const response = NextResponse.json(data);

    if (data.access_token) {
      response.cookies.set("access_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });
    }

    if (data.refresh_token) {
      response.cookies.set("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
