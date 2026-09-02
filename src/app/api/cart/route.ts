import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/auth";

export async function GET() {
  const { ok, status, data } = await apiFetch("/shop/carts/");

  if (!ok) {
    return NextResponse.json(
      data && typeof data === "object"
        ? data
        : { error: status === 401 ? "Unauthorized" : "Failed to fetch cart" },
      { status }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const { ok, status, data } = await apiFetch("/shop/carts/", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return NextResponse.json(data ?? {}, { status: ok ? 201 : status });
}
