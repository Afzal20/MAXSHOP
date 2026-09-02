import { fetchFromAPI } from "@/lib/api";
import { Item } from "@/lib/types";
import { toAbsoluteUrl } from "@/lib/media";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const revalidate = 60; // ISR

export default async function ProductsPage() {
  let products: Item[] = [];

  try {
    const productsRes = await fetchFromAPI("/shop/items/");
    products = productsRes.results || productsRes || [];
  } catch (error) {
    console.error("Failed to fetch products", error);
  }

  // Fallback data if backend is empty for demonstration
  if (products.length === 0) {
    products = [
      {
        id: 1, title: "Premium Leather Jacket", slug: "premium-leather-jacket", price: "299.99", discount_price: "249.99", description: "", images: [], item_size: [{ id: 1, size: { id: 1, name: "M" }, stock: 10, price_for_this_size: 0, item: 1 }] as any, item_color: [{ id: 1, color: { id: 1, name: "Black", hex_code: "#000000" }, item: 1 }] as any,
        category: { id: 1, name: "Clothing", slug: "clothing" }
      },
      {
        id: 2, title: "Minimalist Watch", slug: "minimalist-watch", price: "199.99", description: "", images: [], item_size: [], item_color: [],
        category: { id: 2, name: "Accessories", slug: "accessories" }
      },
      {
        id: 3, title: "Sony WH-1000XM5", slug: "sony-wh", price: "349.99", description: "", images: [], item_size: [], item_color: [],
        category: { id: 3, name: "Electronics", slug: "electronics" }
      },
      {
        id: 4, title: "Designer Sunglasses", slug: "designer-sunglasses", price: "159.99", description: "", images: [], item_size: [], item_color: [],
        category: { id: 2, name: "Accessories", slug: "accessories" }
      },
      {
        id: 5, title: "Classic White Sneakers", slug: "classic-white-sneakers", price: "129.99", description: "", images: [], item_size: [], item_color: [],
        category: { id: 4, name: "Footwear", slug: "footwear" }
      },
      {
        id: 6, title: "Wireless Earbuds", slug: "wireless-earbuds", price: "199.99", discount_price: "149.99", description: "", images: [], item_size: [], item_color: [],
        category: { id: 3, name: "Electronics", slug: "electronics" }
      }
    ];
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-12">
      {/* Page Header */}
      <div className="bg-[#f5f5f5] py-4 border-b border-[#e5e5e5]">
        <div className="container mx-auto px-4 flex text-[12px] text-[#666666]">
          <Link href="/" className="hover:text-[#e34444] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#333333]">Shop</span>
        </div>
      </div>

      <main className="container mx-auto px-4 pt-6 flex flex-col md:flex-row gap-6">
        {/* Left Sidebar (1/4 width) */}
        <aside className="w-full md:w-[270px] flex-shrink-0 flex flex-col gap-6">
          {/* CATEGORIES Menu */}
          <div className="bg-white border border-[#e5e5e5]">
            <div className="bg-[#e34444] text-white font-bold text-[13px] px-4 py-3 flex items-center">
              CATEGORIES
            </div>
            <ul className="text-[13px] text-[#666666] divide-y divide-[#f2f2f2]">
               <li><Link href="#" className="block px-4 py-3 hover:text-[#e34444] hover:pl-5 transition-all uppercase">ALL PRODUCTS</Link></li>
               <li><Link href="#" className="block px-4 py-3 hover:text-[#e34444] hover:pl-5 transition-all uppercase">MOBILE & TABLET</Link></li>
               <li><Link href="#" className="block px-4 py-3 hover:text-[#e34444] hover:pl-5 transition-all uppercase">COMPUTER & ACCESSORIES</Link></li>
               <li><Link href="#" className="block px-4 py-3 hover:text-[#e34444] hover:pl-5 transition-all uppercase">ELECTRONIC & CAMERA</Link></li>
               <li><Link href="#" className="block px-4 py-3 hover:text-[#e34444] hover:pl-5 transition-all uppercase">FASHION & ACCESSORIES</Link></li>
            </ul>
          </div>

          {/* BEST SELLERS */}
          <div className="bg-white border border-[#e5e5e5]">
            <div className="bg-[#e34444] text-white font-bold text-[13px] px-4 py-3">
              FILTER BY PRICE
            </div>
            <div className="p-4 flex flex-col gap-4">
               <div className="h-1 bg-gray-200 relative mb-4">
                 <div className="absolute left-[20%] right-[30%] bg-[#e34444] h-full"></div>
               </div>
               <div className="flex justify-between text-[13px] text-[#666666]">
                 <span>Price: $10 - $299</span>
                 <button className="bg-[#333333] text-white px-3 py-1 text-[11px] font-bold hover:bg-[#e34444] transition-colors">FILTER</button>
               </div>
            </div>
          </div>
        </aside>

        {/* Right Main Content (3/4 width) */}
        <div className="flex-1 flex flex-col gap-6">
          
          <div className="bg-white border border-[#e5e5e5] p-3 flex flex-wrap justify-between items-center text-[13px] text-[#666666]">
             <div className="flex items-center gap-2">
                <span className="font-bold text-[#333333]">View:</span>
                <button className="text-[#e34444]"><SlidersHorizontal className="w-4 h-4" /></button>
             </div>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <label>Sort By:</label>
                   <select className="border border-[#e5e5e5] outline-none p-1">
                     <option>Default Sorting</option>
                     <option>Price: Low to High</option>
                     <option>Price: High to Low</option>
                   </select>
                </div>
                <div className="flex items-center gap-2 hidden sm:flex">
                   <label>Show:</label>
                   <select className="border border-[#e5e5e5] outline-none p-1">
                     <option>12</option>
                     <option>24</option>
                   </select>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 bg-white border-t border-l border-[#e5e5e5]">
            {products.map((product) => (
              <div key={product.id} className="p-4 flex flex-col items-center relative group border-b border-r border-[#e5e5e5]">
                {product.discount_price && <div className="absolute top-2 left-2 bg-[#f27420] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm z-10">SALE</div>}
                
                <div className="w-full aspect-square relative mb-4 flex items-center justify-center p-2">
                  {product.images && product.images.length > 0 ? (
                    <img src={toAbsoluteUrl(product.images[0].image)} alt={product.title} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                  ) : (
                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                
                <div className="flex text-yellow-400 text-[11px] mb-2">★★★★★</div>
                <Link href={`/products/${product.id}`} className="text-[13px] text-[#333333] hover:text-[#e34444] text-center line-clamp-1 mb-2 font-medium transition-colors">
                  {product.title}
                </Link>
                <div className="flex items-center gap-2">
                  {product.discount_price && <span className="text-[12px] text-[#999999] line-through">${product.price}</span>}
                  <span className="text-[16px] font-bold text-[#e34444]">${product.discount_price || product.price}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <div className="flex text-[13px]">
               <button className="px-3 py-1 border border-[#e5e5e5] bg-white hover:bg-[#e34444] hover:text-white transition-colors">Prev</button>
               <button className="px-3 py-1 border-t border-b border-[#e5e5e5] bg-[#e34444] text-white">1</button>
               <button className="px-3 py-1 border border-[#e5e5e5] bg-white hover:bg-[#e34444] hover:text-white transition-colors">2</button>
               <button className="px-3 py-1 border border-l-0 border-[#e5e5e5] bg-white hover:bg-[#e34444] hover:text-white transition-colors">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
