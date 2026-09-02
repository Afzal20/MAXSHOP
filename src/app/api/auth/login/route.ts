import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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

    // Usually DRF SimpleJWT returns { access, refresh }
    if (data.access) {
      (await cookies()).set({
        name: "access_token",
        value: data.access,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15, // 15 minutes
      });
    }

    if (data.refresh) {
      (await cookies()).set({
        name: "refresh_token",
        value: data.refresh,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    // Return the response without exposing tokens directly to frontend if desired,
    // but here we just return it so frontend knows login was successful.
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong during login." },
      { status: 500 }
    );
  }
}
