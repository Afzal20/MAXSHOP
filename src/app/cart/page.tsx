"use client";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock data for initial UI state
const initialCart = [
  {
    id: 1,
    product: {
      id: 1,
      title: "Premium Leather Jacket",
      price: "249.99",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1964&auto=format&fit=crop",
    },
    quantity: 1,
    size: "L",
    color: "Black"
  },
  {
    id: 2,
    product: {
      id: 3,
      title: "Sony WH-1000XM5",
      price: "349.99",
      image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1888&auto=format&fit=crop",
    },
    quantity: 1,
    size: "One Size",
    color: "Silver"
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCart);

  const updateQuantity = (id: number, delta: number) => {
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
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.product.price) * item.quantity), 0);
  const shipping = 15.00;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven&apos;t added anything yet.</p>
            <Link href="/products">
              <Button size="lg" className="rounded-full px-8">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start relative">
                  <div className="w-32 h-32 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden">
                    <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-between h-full w-full">
                    <div className="flex justify-between items-start w-full">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{item.product.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Size: {item.size} | Color: {item.color}</p>
                      </div>
                      <div className="font-bold text-lg">
                        ${item.product.price}
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
                        <span className="w-4 text-center font-medium text-sm">{item.quantity}</span>
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
              ))}
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
