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
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item: product.id,
          quantity: 1,
          item_color_code: selectedColor || "N/A",
          item_size: selectedSize || "N/A",
        }),
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
          <h3 className="text-[13px] font-bold text-[#333333] uppercase mb-2">Color</h3>
          <div className="flex gap-2">
            {product.item_color.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedColor(c.color.hex_code || null)}
                className={`w-8 h-8 border cursor-pointer transition-all ${
                  selectedColor === c.color.hex_code
                    ? "border-[#e34444]"
                    : "border-[#e5e5e5] hover:border-[#999999]"
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
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[13px] font-bold text-[#333333] uppercase">Size</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.item_size.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSize(s.size.name)}
                className={`px-4 py-2 text-[12px] font-bold uppercase transition-all ${
                  selectedSize === s.size.name
                    ? "bg-[#e34444] text-white border border-[#e34444]"
                    : "bg-white text-[#666666] border border-[#e5e5e5] hover:border-[#e34444] hover:text-[#e34444]"
                }`}
                disabled={s.stock === 0}
              >
                {s.size.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 text-[12px] text-white bg-[#e34444] border border-[#cc3a3a] mt-4">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-[12px] text-white bg-green-600 border border-green-700 mt-4">
          Added to cart successfully!
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 mt-auto pt-4">
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="flex-1 bg-[#e34444] text-white h-12 flex items-center justify-center font-bold text-[14px] hover:bg-[#cc3a3a] transition-colors disabled:opacity-50"
        >
          {loading ? (
            "Adding..."
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" /> ADD TO CART
            </>
          )}
        </button>
      </div>
    </div>
  );
}
