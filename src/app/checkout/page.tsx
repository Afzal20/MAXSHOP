"use client";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Info */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <CardTitle className="text-xl">1. Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input placeholder="123 Main St" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input placeholder="New York" />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input placeholder="10001" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-xl">2. Payment Method</CardTitle>
                <Lock className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input className="pl-10" placeholder="0000 0000 0000 0000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiration Date</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input placeholder="123" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Summary */}
          <div className="bg-white p-8 rounded-3xl shadow-sm h-fit sticky top-24 border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Order Total</h2>
            
            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-gray-100">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Premium Leather Jacket</span>
                <span className="font-medium">$249.99</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sony WH-1000XM5</span>
                <span className="font-medium">$349.99</span>
              </div>
            </div>

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">$599.98</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">$15.00</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total to Pay</span>
                <span className="font-bold text-2xl text-primary">$614.98</span>
              </div>
            </div>

            <Button size="lg" className="w-full rounded-full h-14 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Pay $614.98
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" /> Secure encrypted payment
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
