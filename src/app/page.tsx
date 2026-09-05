import { fetchFromAPI } from "@/lib/api";
import { Item, Category } from "@/lib/types";
import { toAbsoluteUrl } from "@/lib/media";
import {
  ArrowRight,
  ShoppingBag,
  Smartphone,
  Laptop,
  Sparkles,
  Watch,
  Shirt,
  Footprints,
  Gem,
  Glasses,
  Sofa,
  Utensils,
  Bike,
  Trophy,
  Flower2,
  Package,
  Layers,
} from "lucide-react";
import Link from "next/link";

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("smart") || lower.includes("phone")) return Smartphone;
  if (lower.includes("laptop") || lower.includes("tablet")) return Laptop;
  if (lower.includes("beauty") || lower.includes("skin")) return Sparkles;
  if (lower.includes("watch")) return Watch;
  if (lower.includes("shirt") || lower.includes("dress") || lower.includes("top")) return Shirt;
  if (lower.includes("shoe")) return Footprints;
  if (lower.includes("jewel")) return Gem;
  if (lower.includes("bag")) return ShoppingBag;
  if (lower.includes("sunglass") || lower.includes("glass")) return Glasses;
  if (lower.includes("furniture") || lower.includes("home")) return Sofa;
  if (lower.includes("kitchen") || lower.includes("grocer")) return Utensils;
  if (lower.includes("motorcycle") || lower.includes("vehicle")) return Bike;
  if (lower.includes("sport")) return Trophy;
  if (lower.includes("fragrance")) return Flower2;
  return Package;
}

export const revalidate = 60; // Revalidate every minute for ISR

export default async function Home() {
  let products: Item[] = [];
  let categories: Category[] = [];

  try {
    const productsRes = await fetchFromAPI("/shop/items/");
    products = productsRes.results || productsRes || [];

    const categoriesRes = await fetchFromAPI("/shop/categories/");
    categories = categoriesRes.results || categoriesRes || [];
  } catch (error) {
    console.error("Failed to fetch homepage data", error);
  }

  // Fallback data if backend is empty for demonstration
  if (products.length === 0) {
    products = [
      {
        id: 1, title: "Premium Leather Jacket", slug: "premium-leather-jacket", price: "299.99", discount_price: "249.99", description: "", images: [], item_size: [{ id: 1, size: { id: 1, name: "M" }, stock: 10 }] as Item["item_size"], item_color: [{ id: 1, color: { id: 1, name: "Black", hex_code: "#000000" } }] as Item["item_color"],
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
    ];
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-12">
      <main className="container mx-auto px-4 pt-6 flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar (1/4 width) */}
        <aside className="w-full md:w-[270px] flex-shrink-0 flex flex-col gap-6">
          
          {/* CATEGORIES Menu */}
          <div className="bg-white border border-[#e5e5e5]">
            <div className="bg-[#e34444] text-white font-bold text-[13px] px-4 py-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                CATEGORIES
              </span>
              <span className="bg-black/20 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                {categories.length}
              </span>
            </div>
            <ul className="text-[13px] text-[#666666] divide-y divide-[#f2f2f2] max-h-[460px] overflow-y-auto">
              {categories.map((cat) => {
                const IconComponent = getCategoryIcon(cat.name);
                return (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${encodeURIComponent(cat.name)}`}
                      className="flex items-center justify-between px-4 py-2.5 hover:text-[#e34444] hover:bg-gray-50 hover:pl-5 transition-all group"
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <IconComponent className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#e34444] flex-shrink-0 transition-colors" />
                        <span className="truncate">{cat.name.replace(/-/g, " ")}</span>
                      </span>
                      <span className="text-gray-300 group-hover:text-[#e34444] text-xs transition-colors">›</span>
                    </Link>
                  </li>
                );
              })}
              {!categories.length && (
                <li className="p-4 text-center text-xs text-gray-400">
                  No categories found
                </li>
              )}
            </ul>
          </div>

          {/* BEST SELLERS */}
          <div className="bg-white border border-[#e5e5e5]">
            <div className="bg-[#e34444] text-white font-bold text-[13px] px-4 py-3">
              BEST SELLERS
            </div>
            <div className="p-4 flex flex-col gap-4">
              {products.slice(0, 3).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex gap-3 group cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="w-20 h-20 border border-[#e5e5e5] flex-shrink-0 overflow-hidden relative flex items-center justify-center p-1 bg-white">
                     {product.images && product.images.length > 0 ? (
                        <img src={toAbsoluteUrl(product.images[0].image)} alt={product.title} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-300" />
                      )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-[13px] text-[#333333] font-medium line-clamp-1 group-hover:text-[#e34444] transition-colors">{product.title}</h4>
                    <div className="flex text-yellow-400 text-[10px] my-1">
                      ★★★★☆
                    </div>
                    <div className="flex items-center gap-2">
                       {product.discount_price && <span className="text-[11px] text-[#999999] line-through">${product.price}</span>}
                       <span className="text-[14px] font-bold text-[#e34444]">${product.discount_price || product.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* LATEST POST */}
          <div className="bg-white border border-[#e5e5e5]">
            <div className="bg-[#e34444] text-white font-bold text-[13px] px-4 py-3">
              LATEST POST
            </div>
            <div className="p-4">
              <img src="https://images.unsplash.com/photo-1512418490979-92798cec1380?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" alt="Blog" className="w-full h-auto mb-3" />
              <h4 className="text-[13px] font-bold text-[#333333] mb-2">Zima daze sima</h4>
              <p className="text-[12px] text-[#666666] line-clamp-4 leading-relaxed">
                Pellentesque et venenatis tortor, vitae sagittis massa. Aliquam erat volutpat. Quisque eu purus convallis, iaculis nisl id, iaculis lacus. Aenean...
              </p>
            </div>
          </div>

          {/* FAQS */}
          <div className="bg-white border border-[#e5e5e5]">
            <div className="bg-[#e34444] text-white font-bold text-[13px] px-4 py-3">
              FAQS
            </div>
            <div className="text-[12px] text-[#666666] divide-y divide-[#f2f2f2]">
               <div className="p-3 bg-[#f9f9f9]">
                 <p className="font-bold mb-1">- Pellentesque vitae imperdiet in?</p>
                 <p className="italic text-gray-500">Donec tempor, odio sed hendrerit placerat, trauma in posuere tortor...</p>
               </div>
               <div className="p-3 hover:bg-gray-50 cursor-pointer">+ Hendrerit eu nunc massa?</div>
               <div className="p-3 hover:bg-gray-50 cursor-pointer">+ Suspendisse feugiat cursus?</div>
            </div>
          </div>
        </aside>


        {/* Right Main Content (3/4 width) */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          {/* Hero Banner */}
          <div className="w-full relative aspect-[21/9] bg-[#e6e6e6] overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-[#94a3b8] to-[#cbd5e1] mix-blend-multiply opacity-50" />
             <img src="https://images.unsplash.com/photo-1527698266440-12104e498b76?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Banner" />
             <div className="absolute inset-0 flex items-center p-12">
                <div className="max-w-md">
                   <h2 className="text-white text-4xl md:text-5xl font-black mb-2 uppercase drop-shadow-md">Our New Range of <br/><span className="text-[#e34444]">TABLET</span></h2>
                   <p className="text-white text-xl font-bold tracking-widest drop-shadow-md">FOR LESS THAN $99.00</p>
                </div>
             </div>
          </div>

          {/* SHOP BY CATEGORY */}
          <div className="bg-white border border-[#e5e5e5] p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-[#e34444]" />
                <h3 className="font-bold text-[#333333] text-[14px] md:text-[15px] uppercase tracking-wide">
                  Shop By Category
                </h3>
              </div>
              <Link
                href="/categories"
                className="text-[12px] font-bold text-[#e34444] hover:underline flex items-center gap-1"
              >
                View All ({categories.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map((cat) => {
                const IconComponent = getCategoryIcon(cat.name);
                return (
                  <Link
                    key={cat.id}
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="flex flex-col items-center justify-center p-3 rounded-none border border-[#f0f0f0] bg-[#fafafa] hover:bg-white hover:border-[#e34444] hover:shadow-sm transition-all group text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-white group-hover:bg-[#e34444]/10 border border-[#e5e5e5] flex items-center justify-center text-[#555555] group-hover:text-[#e34444] transition-colors mb-2">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[12px] font-medium text-[#333333] group-hover:text-[#e34444] transition-colors line-clamp-1">
                      {cat.name.replace(/-/g, " ")}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* HOT DEALS */}
          <div className="border border-[#e34444] bg-white">
            <div className="bg-[#e34444] text-white font-bold text-[14px] px-4 py-2 inline-block relative">
              HOT DEALS
              <div className="absolute top-0 -right-[12px] w-0 h-0 border-t-[18px] border-t-transparent border-b-[18px] border-b-transparent border-l-[12px] border-l-[#e34444]"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-[#e5e5e5] border-t border-[#e5e5e5]">
              {products.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="p-4 flex flex-col items-center relative group cursor-pointer block hover:bg-gray-50/50 transition-colors"
                >
                  <div className="absolute top-2 left-2 bg-[#f27420] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm z-10">SALE</div>
                  
                  <div className="w-full aspect-square relative mb-4 flex items-center justify-center p-2">
                    {product.images && product.images.length > 0 ? (
                      <img src={toAbsoluteUrl(product.images[0].image)} alt={product.title} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-gray-300" />
                    )}
                  </div>
                  
                  {/* Mock Countdown */}
                  <div className="flex gap-1 mb-4">
                    <div className="bg-[#999999] text-white flex flex-col items-center justify-center w-8 h-8 rounded-sm">
                      <span className="text-[12px] font-bold leading-none">268</span>
                      <span className="text-[8px]">DAYS</span>
                    </div>
                    <div className="bg-[#999999] text-white flex flex-col items-center justify-center w-8 h-8 rounded-sm">
                      <span className="text-[12px] font-bold leading-none">13</span>
                      <span className="text-[8px]">HRS</span>
                    </div>
                    <div className="bg-[#999999] text-white flex flex-col items-center justify-center w-8 h-8 rounded-sm">
                      <span className="text-[12px] font-bold leading-none">46</span>
                      <span className="text-[8px]">MINS</span>
                    </div>
                    <div className="bg-[#999999] text-white flex flex-col items-center justify-center w-8 h-8 rounded-sm">
                      <span className="text-[12px] font-bold leading-none">15</span>
                      <span className="text-[8px]">SECS</span>
                    </div>
                  </div>

                  <div className="flex text-yellow-400 text-[11px] mb-2">★★★★★</div>
                  <h4 className="text-[13px] text-[#333333] group-hover:text-[#e34444] text-center line-clamp-1 mb-2 font-medium transition-colors">
                    {product.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    {product.discount_price && <span className="text-[12px] text-[#999999] line-through">${product.price}</span>}
                    <span className="text-[16px] font-bold text-[#e34444]">${product.discount_price || product.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ELECTRONICS BANNER */}
          <div className="bg-[#e34444] flex flex-col md:flex-row text-white mt-4 border-b-4 border-[#cc3a3a]">
             <div className="p-4 md:p-6 flex-1 flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-black mb-1">NEW ARRIVALS</h3>
                <p className="text-[13px] opacity-90">Curabitur luctus ipsum eget convallis</p>
             </div>
             <div className="bg-[#cc3a3a] p-4 flex items-center justify-center gap-4">
                <div className="text-center">
                  <span className="text-4xl font-black block leading-none">50%</span>
                  <span className="text-[11px] font-bold tracking-widest">OFF</span>
                </div>
                <div className="text-[11px] font-bold leading-tight border-l border-white/20 pl-4">
                  ON ALL<br/>PRODUCTS
                </div>
             </div>
             <div className="flex-1 bg-[url('https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2027&auto=format&fit=crop')] bg-cover bg-center hidden md:block opacity-60">
             </div>
          </div>

          {/* ELECTRONICS PRODUCTS */}
          <div className="bg-white border border-[#e5e5e5]">
            <div className="flex border-b border-[#e5e5e5]">
              <div className="bg-[#e34444] text-white font-bold text-[14px] px-4 py-2 inline-block relative">
                ELECTRONICS
                <div className="absolute top-0 -right-[12px] w-0 h-0 border-t-[18px] border-t-transparent border-b-[18px] border-b-transparent border-l-[12px] border-l-[#e34444] z-10"></div>
              </div>
              <div className="flex-1 flex justify-end gap-4 text-[12px] text-[#666666] px-4 items-center overflow-x-auto hidden md:flex">
                {categories
                  .filter((c) => ["Laptops", "Smartphones", "Tablets", "Mobile-Accessories"].includes(c.name))
                  .map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${encodeURIComponent(c.name)}`}
                      className="hover:text-[#e34444] transition-colors whitespace-nowrap"
                    >
                      {c.name.replace(/-/g, " ")}
                    </Link>
                  ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-[#e5e5e5]">
              {products.slice(0, 4).reverse().map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="p-4 flex flex-col items-center relative group cursor-pointer block hover:bg-gray-50/50 transition-colors"
                >
                  {product.discount_price && <div className="absolute top-2 left-2 bg-[#f27420] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm z-10">SALE</div>}
                  
                  <div className="w-full aspect-square relative mb-4 flex items-center justify-center p-2">
                    {product.images && product.images.length > 0 ? (
                      <img src={toAbsoluteUrl(product.images[0].image)} alt={product.title} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-gray-300" />
                    )}
                  </div>
                  
                  <div className="flex text-yellow-400 text-[11px] mb-2">★★★★★</div>
                  <h4 className="text-[13px] text-[#333333] group-hover:text-[#e34444] text-center line-clamp-1 mb-2 font-medium transition-colors">
                    {product.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    {product.discount_price && <span className="text-[12px] text-[#999999] line-through">${product.price}</span>}
                    <span className="text-[16px] font-bold text-[#e34444]">${product.discount_price || product.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* MOBILES BANNER */}
          <div className="bg-[#315682] flex flex-col md:flex-row text-white mt-4 border-b-4 border-[#254366]">
             <div className="p-4 md:p-6 flex-1 flex flex-col justify-center bg-[#8dc0ea]">
                <h3 className="text-[#315682] text-[12px] font-bold mb-1">END OF SEASON</h3>
                <h3 className="text-[#e34444] text-2xl md:text-3xl font-black mb-1">SAVE 50% OFF</h3>
                <p className="text-[#315682] text-[12px] font-medium">ALL ITEMS SELECTED</p>
             </div>
             <div className="p-4 md:p-6 flex-1 flex flex-col justify-center items-center text-center">
                <h3 className="text-yellow-400 text-2xl font-black mb-1">NEW WATCHES</h3>
                <p className="text-[12px]">UP TO <strong>25%</strong> OFF on all items</p>
             </div>
          </div>

        </div>

      </main>
    </div>
  );
}
