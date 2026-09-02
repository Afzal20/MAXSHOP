import { fetchFromAPI } from "@/lib/api";
import { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Heart, Share2, Tag, Package, Star, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActionForm } from "@/components/ProductActionForm";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
              <div className="mb-4 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {typeof product.category === 'object' ? (product.category as any)?.name : 'Category'}
                  </span>
                  {product.type && (
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                      {product.type.name}
                    </span>
                  )}
                  {product.is_bestselling && (
                    <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Bestseller
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {product.brand_name && (
                <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-1">
                  {product.brand_name}
                </p>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                {product.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                {product.product_id && (
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900">SKU:</span> {product.product_id}
                  </span>
                )}
                {product.number_of_items !== undefined && (
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4 text-gray-400" />
                    {product.number_of_items > 0 ? (
                      <span className="text-green-600 font-medium">{product.number_of_items} in stock</span>
                    ) : (
                      <span className="text-red-600 font-medium">Out of stock</span>
                    )}
                  </span>
                )}
              </div>

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

              {/* Actions & Selectors */}
              <ProductActionForm product={product} />

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
