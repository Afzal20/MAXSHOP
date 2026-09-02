import { fetchFromAPI } from "@/lib/api";
import { Item } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, ChevronLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60; // ISR

export default async function ProductPage({ params }: { params: { id: string } }) {
  let product: Item | null = null;
  
  try {
    product = await fetchFromAPI(`/shop/items/${params.id}/`);
  } catch (error) {
    console.error("Failed to fetch product", error);
  }

  if (!product) {
    // mock data fallback for UI development
    if (params.id === "1") {
      product = {
        id: 1, title: "Premium Leather Jacket", slug: "premium-leather-jacket", price: "299.99", discount_price: "249.99", 
        description: "Experience the epitome of luxury with our Premium Leather Jacket. Crafted from 100% genuine full-grain leather, this jacket offers not just style, but durability that lasts a lifetime. Features a tailored fit, premium YKK zippers, and a silky smooth interior lining.", 
        images: [{ id: 1, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1964&auto=format&fit=crop" }], 
        sizes: [{id: 1, size: {id:1, name: "M"}, stock: 10}, {id: 2, size: {id:2, name: "L"}, stock: 5}], 
        colors: [{id: 1, color: {id: 1, name: "Black", hex_code: "#000000"}}],
        category: { id: 1, name: "Clothing", slug: "clothing" }
      };
    } else {
      notFound();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to store
        </Link>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
            
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0].image} 
                    alt={product.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
                {product.discount_price && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-4 py-1.5 rounded-full shadow-lg">
                    SALE
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {product.images.map((img) => (
                    <div key={img.id} className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors">
                      <img src={img.image} alt="thumbnail" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
                  {product.category?.name}
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
                {product.title}
              </h1>
              
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-extrabold text-gray-900">
                  ${product.discount_price || product.price}
                </span>
                {product.discount_price && (
                  <span className="text-xl text-muted-foreground line-through font-medium">
                    ${product.price}
                  </span>
                )}
              </div>

              <div className="prose prose-sm text-gray-600 mb-8 leading-relaxed">
                <p>{product.description || "No description provided."}</p>
              </div>

              <hr className="my-6 border-gray-100" />

              {/* Selectors */}
              <div className="space-y-6 mb-8 flex-grow">
                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase mb-3">Color</h3>
                    <div className="flex gap-3">
                      {product.colors.map((c) => (
                        <div 
                          key={c.id} 
                          className="w-10 h-10 rounded-full border-2 border-transparent hover:border-gray-900 cursor-pointer shadow-sm transition-all"
                          style={{ backgroundColor: c.color.hex_code || '#000' }}
                          title={c.color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase">Size</h3>
                      <button className="text-sm text-primary hover:underline font-medium">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map((s) => (
                        <Button 
                          key={s.id} 
                          variant="outline" 
                          className="h-12 px-6 rounded-xl border-gray-200 hover:border-gray-900 font-medium"
                          disabled={s.stock === 0}
                        >
                          {s.size.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-auto pt-6">
                <Button size="lg" className="flex-1 h-14 rounded-xl text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
