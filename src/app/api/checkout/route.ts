import { NextResponse } from "next/server";
import { API_URL } from "@/lib/constants";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const headers = {
      "Content-Type": "application/json",
      "Cookie": `access_token=${accessToken}`,
    };

    // 1. Fetch current cart
    const cartRes = await fetch(`${API_URL}/shop/carts/`, { headers });
    if (!cartRes.ok) throw new Error("Failed to fetch cart");
    const cartItems = await cartRes.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 2. Create the Order
    // Map Next.js form data to DRF Order model requirements
    const orderData = {
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: "+10000000000", // Placeholder if frontend doesn't provide
      district: body.state || "N/A",
      upozila: "N/A",
      city: body.city,
      address: body.address,
      payment_method: "Stripe",
      phone_number_payment: "+10000000000"
    };

    const orderRes = await fetch(`${API_URL}/shop/orders/`, {
      method: "POST",
      headers,
      body: JSON.stringify(orderData),
    });

    if (!orderRes.ok) {
      const err = await orderRes.json();
      console.error("Order creation failed:", err);
      throw new Error("Failed to create order");
    }
    const order = await orderRes.json();

    // 3. Create OrderItems for each Cart item
    for (const item of cartItems) {
      const orderItemData = {
        order: order.id,
        product: item.item.title || "Product",
        quantity: item.quantity,
        price: item.item.discount_price || item.item.price,
        color: item.item_color_code || "N/A",
        size: item.item_size || "N/A"
      };

      const orderItemRes = await fetch(`${API_URL}/shop/order-items/`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderItemData),
      });
      if (!orderItemRes.ok) {
        console.error("OrderItem creation failed:", await orderItemRes.text());
      }
      
      // Delete the cart item
      await fetch(`${API_URL}/shop/carts/${item.id}/`, {
        method: "DELETE",
        headers,
      });
    }

    // 4. Create Stripe Checkout Session
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const stripeRes = await fetch(`${API_URL}/shop/stripe/create-checkout-session/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ 
        order_id: order.id,
        success_url: `${origin}/checkout/success`,
        cancel_url: `${origin}/checkout`,
      }),
    });

    if (!stripeRes.ok) {
      const err = await stripeRes.json();
      throw new Error(err.error || "Failed to create Stripe session");
    }

    const stripeData = await stripeRes.json();

    // 5. Return the URL to redirect to Stripe Checkout
    return NextResponse.json({ url: stripeData.url });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during checkout" },
      { status: 500 }
    );
  }
}
