import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { ok, status, data } = await apiFetch("/accounts/password/change/", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!ok) {
    return NextResponse.json(
      data && typeof data === "object"
        ? data
        : { error: status === 401 ? "Unauthorized" : "Failed to change password" },
      { status }
    );
  }
  return NextResponse.json(data);
}
