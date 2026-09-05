import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/auth";

export async function GET() {
  const { ok, status, data } = await apiFetch("/accounts/user/profile/");
  if (!ok) {
    return NextResponse.json(
      data && typeof data === "object"
        ? data
        : { error: status === 401 ? "Unauthorized" : "Failed to load profile" },
      { status }
    );
  }
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { ok, status, data } = await apiFetch("/accounts/user/profile/", {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!ok) {
    return NextResponse.json(
      data && typeof data === "object"
        ? data
        : { error: status === 401 ? "Unauthorized" : "Failed to update profile" },
      { status }
    );
  }
  return NextResponse.json(data);
}
