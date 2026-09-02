import { fetchFromAPI } from "@/lib/api";
import { Item } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
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
        id: 1, title: "Premium Leather Jacket", slug: "premium-leather-jacket", price: "299.99", discount_price: "249.99", description: "", images: [], sizes: [], colors: [],
        category: { id: 1, name: "Clothing", slug: "clothing" }
      },
      {
        id: 2, title: "Minimalist Watch", slug: "minimalist-watch", price: "199.99", description: "", images: [], sizes: [], colors: [],
        category: { id: 2, name: "Accessories", slug: "accessories" }
      },
      {
        id: 3, title: "Sony WH-1000XM5", slug: "sony-wh", price: "349.99", description: "", images: [], sizes: [], colors: [],
        category: { id: 3, name: "Electronics", slug: "electronics" }
      },
      {
        id: 4, title: "Designer Sunglasses", slug: "designer-sunglasses", price: "159.99", description: "", images: [], sizes: [], colors: [],
        category: { id: 2, name: "Accessories", slug: "accessories" }
      },
      {
        id: 5, title: "Classic White Sneakers", slug: "classic-white-sneakers", price: "129.99", description: "", images: [], sizes: [], colors: [],
        category: { id: 4, name: "Footwear", slug: "footwear" }
      },
      {
        id: 6, title: "Wireless Earbuds", slug: "wireless-earbuds", price: "199.99", discount_price: "149.99", description: "", images: [], sizes: [], colors: [],
        category: { id: 3, name: "Electronics", slug: "electronics" }
      }
    ];
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">All Products</h1>
            <p className="text-muted-foreground mt-2">Explore our entire collection of premium items.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" className="flex-shrink-0">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white cursor-pointer rounded-2xl flex flex-col">
              <Link href={`/products/${product.id}`} className="flex-grow">
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].image} 
                      alt={product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="h-12 w-12 opacity-20" />
                    </div>
                  )}
                  {product.discount_price && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      SALE
                    </div>
                  )}
                </div>
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
                    {product.category?.name || "Uncategorized"}
                  </p>
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-bold text-xl">${product.discount_price || product.price}</span>
                    {product.discount_price && (
                      <span className="text-sm text-muted-foreground line-through">${product.price}</span>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
