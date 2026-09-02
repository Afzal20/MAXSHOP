import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Fetch the current cart
    const cart = await apiFetch("/shop/carts/");
    if (!cart.ok) {
      return NextResponse.json(
        cart.status === 401
          ? { error: "Please sign in to continue." }
          : { error: "Failed to fetch cart" },
        { status: cart.status }
      );
    }

    const cartItems = Array.isArray(cart.data) ? cart.data : [];
    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    // 2. Create the Order
    const orderData = {
      first_name: body.first_name || "Guest",
      last_name: body.last_name || "Guest",
      phone_number: "+10000000000", // placeholder until a phone field is collected
      district: body.state || "N/A",
      upozila: "N/A",
      city: body.city || "N/A",
      address: body.address || "",
      payment_method: "Stripe",
      phone_number_payment: "+10000000000",
    };

    const orderRes = await apiFetch("/shop/orders/", {
      method: "POST",
      body: JSON.stringify(orderData),
    });

    if (!orderRes.ok) {
      const detail =
        (orderRes.data as any)?.detail ||
        (orderRes.data as any)?.error ||
        "Failed to create order";
      return NextResponse.json({ error: detail }, { status: orderRes.status });
    }

    const order = orderRes.data as any;

    // 3. Create OrderItems and clear the cart
    for (const item of cartItems) {
      const orderItemRes = await apiFetch("/shop/order-items/", {
        method: "POST",
        body: JSON.stringify({
          order: order.id,
          product: item.item?.title || "Product",
          quantity: item.quantity,
          price: item.item?.discount_price || item.item?.price,
          color: item.item_color_code || "N/A",
          size: item.item_size || "N/A",
        }),
      });

      if (!orderItemRes.ok) {
        return NextResponse.json(
          { error: "Failed to create order item" },
          { status: orderItemRes.status }
        );
      }

      // Best-effort cart cleanup (backend deletes the line item)
      await apiFetch(`/shop/carts/${item.id}/`, { method: "DELETE" });
    }

    // 4. Create the Stripe Checkout Session
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const stripeRes = await apiFetch("/shop/stripe/create-checkout-session/", {
      method: "POST",
      body: JSON.stringify({
        order_id: order.id,
        success_url: `${origin}/checkout/success`,
        cancel_url: `${origin}/checkout`,
      }),
    });

    if (!stripeRes.ok) {
      const errMsg =
        (stripeRes.data as any)?.error || "Failed to create Stripe session";
      return NextResponse.json({ error: errMsg }, { status: stripeRes.status });
    }

    // 5. Return the Stripe Checkout URL to redirect to
    return NextResponse.json({ url: (stripeRes.data as any)?.url });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred during checkout" },
      { status: 500 }
    );
  }
}
