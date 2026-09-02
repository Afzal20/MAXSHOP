import { fetchFromAPI } from "@/lib/api";
import { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Heart, Share2, Tag, Package, Star, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActionForm } from "@/components/ProductActionForm";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInteractions } from "@/components/ProductInteractions";

export const revalidate = 60; // ISR

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductPage({ params, searchParams }: Props) {
  // Await the params promise in Next.js 15
  const resolvedParams = await params;

  let product: Item | null = null;

  try {
    product = await fetchFromAPI(`/shop/items/${resolvedParams.id}/`);
  } catch (error) {
    console.error("Failed to fetch product for id", resolvedParams.id, error);
  }

  if (!product) {
    // mock data fallback for UI development
    if (resolvedParams.id === "1") {
      product = {
        id: 1, title: "Premium Leather Jacket", slug: "premium-leather-jacket", price: "299.99", discount_price: "249.99",
        description: "Experience the epitome of luxury with our Premium Leather Jacket. Crafted from 100% genuine full-grain leather, this jacket offers not just style, but durability that lasts a lifetime. Features a tailored fit, premium YKK zippers, and a silky smooth interior lining.",
        images: [{ id: 1, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1964&auto=format&fit=crop" }],
        item_size: [{ id: 1, size: { id: 1, name: "M" }, stock: 10, price_for_this_size: 0, item: 1 }, { id: 2, size: { id: 2, name: "L" }, stock: 5, price_for_this_size: 0, item: 1 }] as any,
        item_color: [{ id: 1, color: { id: 1, name: "Black", code: "#000000" }, item: 1 }] as any,
        category: 1
      };
    } else {
      notFound();
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-12">
      {/* Page Header */}
      <div className="bg-[#f5f5f5] py-4 border-b border-[#e5e5e5]">
        <div className="container mx-auto px-4 flex text-[12px] text-[#666666]">
          <Link href="/" className="hover:text-[#e34444] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-[#e34444] transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-[#333333]">{product.title}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 pt-6">
        <div className="bg-white border border-[#e5e5e5]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Gallery - Left Side */}
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#e5e5e5]">
              <ProductGallery 
                images={product.images} 
                title={product.title} 
                discount_price={product.discount_price} 
              />
            </div>

            {/* Product Info - Right Side */}
            <div className="p-6 md:p-8 flex flex-col">
              
              <div className="mb-2">
                <span className="bg-[#e34444] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                  {typeof product.category === 'object' ? (product.category as any)?.name : 'Category'}
                </span>
                {product.is_bestselling && (
                  <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider ml-2">
                    Bestseller
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-[#333333] mb-2">
                {product.title}
              </h1>

              <div className="flex text-yellow-400 text-[13px] mb-4">
                ★★★★★ <span className="text-[#999999] ml-2">(12 reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-[#e5e5e5]">
                <span className="text-3xl font-black text-[#e34444]">
                  ${product.discount_price || product.price}
                </span>
                {product.discount_price && (
                  <span className="text-lg text-[#999999] line-through font-medium">
                    ${product.price}
                  </span>
                )}
              </div>

              <div className="text-[13px] text-[#666666] leading-relaxed mb-6">
                <p>{product.description || "No description provided for this product."}</p>
              </div>

              <div className="text-[13px] text-[#333333] mb-6 space-y-2">
                {product.product_id && (
                  <div><span className="font-bold">Product ID:</span> {product.product_id}</div>
                )}
                {product.number_of_items !== undefined && (
                  <div>
                    <span className="font-bold">Availability:</span>{" "}
                    {product.number_of_items > 0 ? (
                      <span className="text-green-600 font-bold">In Stock ({product.number_of_items})</span>
                    ) : (
                      <span className="text-red-600 font-bold">Out of stock</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mb-6">
                 <ProductInteractions productId={product.id} title={product.title} />
              </div>

              <hr className="border-[#e5e5e5] mb-6" />

              {/* Actions & Selectors */}
              <ProductActionForm product={product} />

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
