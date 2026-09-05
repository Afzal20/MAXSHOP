"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
  });

  useEffect(() => {
    fetchCart();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const firstName = params.get("first_name") || params.get("name") || "";
      const city = params.get("city") || "";
      const address = params.get("address") || "";
      if (firstName || city || address) {
        setFormData((prev) => ({
          ...prev,
          ...(firstName ? { first_name: firstName } : {}),
          ...(city ? { city } : {}),
          ...(address ? { address } : {}),
        }));
      }
    }
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        // Redirect to Stripe Checkout Session
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const subtotal = cartItems.reduce((total, cartItem) => {
    const product = cartItem.product || cartItem.item;
    if (!product) return total;
    const price = parseFloat(product.discount_price || product.price);
    return total + price * cartItem.quantity;
  }, 0);

  const shipping = cartItems.length > 0 ? 15 : 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#dc3545]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col pb-12">
      <main className="flex-grow container mx-auto px-4 py-8 mt-8">
        <h1 className="text-2xl font-bold uppercase text-[#333333] mb-8">Checkout</h1>

        {error && (
          <div className="mb-8 p-4 bg-[#f8d7da] text-[#721c24] border border-[#f5c6cb]">
            {error}
          </div>
        )}

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <div className="bg-white border border-[#e5e5e5]">
              <div className="bg-[#f5f5f5] border-b border-[#e5e5e5] p-4">
                <h2 className="text-[16px] font-bold uppercase text-[#333333]">Shipping Information</h2>
              </div>
              <div className="p-6 space-y-4 text-[13px] text-[#666666]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold uppercase text-[#333333]">First Name</Label>
                    <Input className="rounded-none border-[#e5e5e5] focus-visible:ring-[#dc3545]" name="first_name" required value={formData.first_name} onChange={handleInputChange} placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold uppercase text-[#333333]">Last Name</Label>
                    <Input className="rounded-none border-[#e5e5e5] focus-visible:ring-[#dc3545]" name="last_name" required value={formData.last_name} onChange={handleInputChange} placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold uppercase text-[#333333]">Address</Label>
                  <Input className="rounded-none border-[#e5e5e5] focus-visible:ring-[#dc3545]" name="address" required value={formData.address} onChange={handleInputChange} placeholder="123 Main St" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold uppercase text-[#333333]">City</Label>
                    <Input className="rounded-none border-[#e5e5e5] focus-visible:ring-[#dc3545]" name="city" required value={formData.city} onChange={handleInputChange} placeholder="New York" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold uppercase text-[#333333]">State/District</Label>
                    <Input className="rounded-none border-[#e5e5e5] focus-visible:ring-[#dc3545]" name="state" required value={formData.state} onChange={handleInputChange} placeholder="NY" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold uppercase text-[#333333]">Postal Code</Label>
                    <Input className="rounded-none border-[#e5e5e5] focus-visible:ring-[#dc3545]" name="postal_code" required value={formData.postal_code} onChange={handleInputChange} placeholder="10001" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#e2e3e5] text-[#383d41] p-4 border border-[#d6d8db] flex items-start gap-4">
              <Lock className="w-5 h-5 text-[#383d41] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-[14px] uppercase">Secure Stripe Payment</h3>
                <p className="text-[13px] mt-1">
                  You will be redirected to Stripe's secure checkout page to complete your payment. 
                  We do not store your payment information.
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="bg-white p-6 border border-[#e5e5e5] h-fit sticky top-24">
            <h2 className="text-[16px] font-bold uppercase text-[#333333] border-b border-[#e5e5e5] pb-4 mb-4">Order Total</h2>

            <div className="space-y-3 text-[14px] text-[#666666] mb-6 pb-6 border-b border-[#e5e5e5]">
              {cartItems.map((item, i) => {
                const product = item.product || item.item;
                if (!product) return null;
                return (
                  <div key={i} className="flex justify-between">
                    <span className="line-clamp-1 mr-4 text-[#333333]">{product.title} <span className="text-[#666666]">x {item.quantity}</span></span>
                    <span className="font-bold text-[#333333] shrink-0">
                      ${(parseFloat(product.discount_price || product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 text-[14px] text-[#666666] mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#333333]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold text-[#333333]">${shipping.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-[#e5e5e5] pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase text-[#333333]">Total to Pay</span>
                <span className="font-bold text-[20px] text-[#dc3545]">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={processing || cartItems.length === 0}
              size="lg" 
              className="w-full bg-[#dc3545] hover:bg-[#c82333] text-white font-bold uppercase rounded-none h-12 transition-colors disabled:opacity-50"
            >
              {processing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
              ) : (
                `Pay $${total.toFixed(2)} with Stripe`
              )}
            </Button>

            <p className="text-[12px] text-center text-[#666666] mt-4 flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" /> Secure encrypted payment
            </p>
          </div>

        </form>
      </main>
    </div>
  );
}
