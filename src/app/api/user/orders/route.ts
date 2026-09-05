import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/auth";

export async function GET() {
  const { ok, status, data } = await apiFetch("/shop/orders/");
  if (!ok) {
    return NextResponse.json(
      data && typeof data === "object"
        ? data
        : { error: status === 401 ? "Unauthorized" : "Failed to load orders" },
      { status }
    );
  }
  return NextResponse.json(data);
}
