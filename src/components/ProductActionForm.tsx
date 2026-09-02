"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProductActionForm({ product }: { product: Item }) {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.item_color && product.item_color.length > 0 ? (product.item_color[0].color.hex_code || null) : null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.item_size && product.item_size.length > 0 ? product.item_size[0].size.name : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleAddToCart = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        item: product.id,
        item_color_code: selectedColor || "",
        item_size: selectedSize || "",
        quantity: 1, // Defaulting to 1 for now
      };

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Please log in to add items to your cart.");
        }
        throw new Error(data.detail || data.error || "Failed to add to cart");
      }

      setSuccess(true);
      router.refresh();
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex-grow flex flex-col">
      {/* Colors */}
      {product.item_color && product.item_color.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase mb-3">Color</h3>
          <div className="flex gap-3">
            {product.item_color.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedColor(c.color.hex_code || null)}
                className={`w-10 h-10 rounded-full border-2 cursor-pointer shadow-sm transition-all ${
                  selectedColor === c.color.hex_code
                    ? "border-gray-900 scale-110"
                    : "border-transparent hover:border-gray-400"
                }`}
                style={{ backgroundColor: c.color.hex_code || "#000" }}
                title={c.color.name}
                aria-label={`Select color ${c.color.name}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {product.item_size && product.item_size.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase">Size</h3>
            <button className="text-sm text-primary hover:underline font-medium">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {product.item_size.map((s) => (
              <Button
                key={s.id}
                variant={selectedSize === s.size.name ? "default" : "outline"}
                onClick={() => setSelectedSize(s.size.name)}
                className={`h-12 px-6 rounded-xl font-medium ${
                  selectedSize === s.size.name
                    ? "bg-gray-900 text-white"
                    : "border-gray-200 hover:border-gray-900 text-gray-900"
                }`}
                disabled={s.stock === 0}
              >
                {s.size.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 mt-4">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200 mt-4">
          Added to cart successfully!
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 mt-auto pt-6">
        <Button
          onClick={handleAddToCart}
          disabled={loading}
          size="lg"
          className="flex-1 h-14 rounded-xl text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          {loading ? (
            "Adding..."
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
