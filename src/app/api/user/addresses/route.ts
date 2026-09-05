import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/auth";

export async function GET() {
  const { ok, status, data } = await apiFetch("/shop/billing-addresses/");
  if (!ok) {
    return NextResponse.json(
      data && typeof data === "object"
        ? data
        : { error: status === 401 ? "Unauthorized" : "Failed to load addresses" },
      { status }
    );
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const payload = {
    street_address: body.street_address || "",
    apartment_address: body.apartment_address || "Apt/Suite",
    country: body.country || "BD",
    zip: body.zip || body.zip_code || "1000",
  };

  const { ok, status, data } = await apiFetch("/shop/billing-addresses/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!ok) {
    return NextResponse.json(
      data && typeof data === "object"
        ? data
        : { error: status === 401 ? "Unauthorized" : "Failed to save address" },
      { status }
    );
  }
  return NextResponse.json(data);
}
