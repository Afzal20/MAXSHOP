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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Info */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <CardTitle className="text-xl">Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input name="first_name" required value={formData.first_name} onChange={handleInputChange} placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input name="last_name" required value={formData.last_name} onChange={handleInputChange} placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input name="address" required value={formData.address} onChange={handleInputChange} placeholder="123 Main St" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input name="city" required value={formData.city} onChange={handleInputChange} placeholder="New York" />
                  </div>
                  <div className="space-y-2">
                    <Label>State/District</Label>
                    <Input name="state" required value={formData.state} onChange={handleInputChange} placeholder="NY" />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input name="postal_code" required value={formData.postal_code} onChange={handleInputChange} placeholder="10001" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 text-blue-800 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
              <Lock className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">Secure Stripe Payment</h3>
                <p className="text-sm opacity-90 mt-1">
                  You will be redirected to Stripe's secure checkout page to complete your payment. 
                  We do not store your payment information.
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="bg-white p-8 rounded-3xl shadow-sm h-fit sticky top-24 border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Order Total</h2>

            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-gray-100">
              {cartItems.map((item, i) => {
                const product = item.product || item.item;
                if (!product) return null;
                return (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground line-clamp-1 mr-4">{product.title} x {item.quantity}</span>
                    <span className="font-medium shrink-0">
                      ${(parseFloat(product.discount_price || product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">${shipping.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total to Pay</span>
                <span className="font-bold text-2xl text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={processing || cartItems.length === 0}
              size="lg" 
              className="w-full rounded-full h-14 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              {processing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
              ) : (
                `Pay $${total.toFixed(2)} with Stripe`
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" /> Secure encrypted payment
            </p>
          </div>

        </form>
      </main>
    </div>
  );
}
