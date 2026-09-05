"use client";

import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight, Minus, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toAbsoluteUrl } from "@/lib/media";

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
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#dc3545]" />
        </main>
      </div>
    );
  }

  if (error === "unauthorized") {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
          <div className="bg-white border border-[#e5e5e5] p-12 w-full max-w-2xl">
            <h1 className="text-2xl font-bold uppercase text-[#333333] mb-4">Please sign in</h1>
            <p className="text-[#666666] mb-8">You need to be signed in to view your cart.</p>
            <Link href="/login">
              <Button size="lg" className="bg-[#dc3545] hover:bg-[#c82333] text-white font-bold uppercase rounded-none px-8">Sign In</Button>
            </Link>
          </div>
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
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col pb-12">
      {/* Page Header */}
      <div className="bg-[#f5f5f5] py-4 border-b border-[#e5e5e5]">
        <div className="container mx-auto px-4 flex text-[12px] text-[#666666]">
          <Link href="/" className="hover:text-[#dc3545] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#333333]">Shopping Cart</span>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 mt-8">
        <h1 className="text-2xl font-bold uppercase text-[#333333] mb-6">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#e5e5e5]">
            <h2 className="text-xl font-bold uppercase text-[#333333] mb-4">Your cart is empty</h2>
            <p className="text-[#666666] mb-8">Looks like you haven't added anything yet.</p>
            <Link href="/products">
              <Button size="lg" className="bg-[#dc3545] hover:bg-[#c82333] text-white font-bold uppercase rounded-none px-8">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = item.product || item.item;
                if (!product) return null;

                return (
                  <div key={item.id} className="bg-white p-4 border border-[#e5e5e5] flex flex-col sm:flex-row gap-6 items-center sm:items-start relative">
                    <Link
                      href={`/products/${product.id}`}
                      className="w-24 h-24 bg-[#f5f5f5] flex-shrink-0 overflow-hidden border border-[#e5e5e5] block hover:opacity-90 transition-opacity"
                    >
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={toAbsoluteUrl(
                            (product.images[0] as any)?.image ||
                              (typeof product.images[0] === "string" ? product.images[0] : undefined)
                          )}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#f5f5f5]" />
                      )}
                    </Link>

                    <div className="flex-grow flex flex-col justify-between h-full w-full">
                      <div className="flex justify-between items-start w-full">
                        <div>
                          <Link href={`/products/${product.id}`} className="font-bold text-[14px] text-[#333333] hover:text-[#dc3545] transition-colors line-clamp-1">{product.title}</Link>
                          <p className="text-[13px] text-[#666666] mt-1">Size: {item.size?.name || 'Standard'} | Color: {item.color?.name || 'Standard'}</p>
                        </div>
                        <div className="font-bold text-[16px] text-[#dc3545]">
                          ${product.price}
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-4 w-full">
                        <div className="flex items-center border border-[#e5e5e5]">
                          <button
                            className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#333333] transition-colors"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center font-medium text-[13px] text-[#333333]">{item.quantity || 1}</span>
                          <button
                            className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#333333] transition-colors"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          className="text-[#666666] hover:text-[#dc3545] transition-colors text-[13px] font-bold flex items-center gap-1"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 border border-[#e5e5e5] h-fit sticky top-24">
              <h2 className="text-[16px] font-bold uppercase text-[#333333] border-b border-[#e5e5e5] pb-4 mb-4">Order Summary</h2>

              <div className="space-y-3 text-[14px] text-[#666666] mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#333333]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Estimate</span>
                  <span className="font-bold text-[#333333]">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-bold text-[#333333]">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-[#e5e5e5] pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase text-[#333333]">Total</span>
                  <span className="font-bold text-[20px] text-[#dc3545]">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full bg-[#dc3545] hover:bg-[#c82333] text-white font-bold uppercase rounded-none h-12 transition-colors">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
