"use client";

import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight, Minus, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch("/api/cart");
        if (res.status === 401) {
          setError("unauthorized");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch cart");
        }

        const data = await res.json();
        // Assuming DRF returns { results: [...] } or just [...]
        setCartItems(data.results || data || []);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, []);

  const updateQuantity = (id: number, delta: number) => {
    // Note: In a real app, this should call a backend API to update quantity.
    // Doing it optimistically for now.
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (id: number) => {
    // Note: Should call backend DELETE endpoint here.
    setCartItems(items => items.filter(item => item.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (error === "unauthorized") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center mt-20">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Please sign in</h1>
          <p className="text-muted-foreground mb-8">You need to be signed in to view your cart.</p>
          <Link href="/login">
            <Button size="lg" className="rounded-full px-8">Sign In</Button>
          </Link>
        </main>
      </div>
    );
  }

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || item.item?.price || 0;
    return acc + (parseFloat(price) * (item.quantity || 1));
  }, 0);
  const shipping = cartItems.length > 0 ? 15.00 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
            <Link href="/products">
              <Button size="lg" className="rounded-full px-8">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = item.product || item.item;
                if (!product) return null;

                return (
                  <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start relative">
                    <div className="w-32 h-32 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0].image || product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>

                    <div className="flex-grow flex flex-col justify-between h-full w-full">
                      <div className="flex justify-between items-start w-full">
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">Size: {item.size?.name || 'Standard'} | Color: {item.color?.name || 'Standard'}</p>
                        </div>
                        <div className="font-bold text-lg">
                          ${product.price}
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-6 w-full">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-full border border-gray-200 p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-4 text-center font-medium text-sm">{item.quantity || 1}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="bg-white p-8 rounded-3xl shadow-sm h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Estimate</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full rounded-full h-14 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
