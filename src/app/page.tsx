import { fetchFromAPI } from "@/lib/api";
import { Item, Category } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

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
    ];
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[80vh] min-h-[600px] w-full bg-slate-900 flex items-center justify-center overflow-hidden">
          {/* Abstract gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 opacity-90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30" />
          
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-6 drop-shadow-lg">
              Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Style</span>
            </h1>
            <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow">
              Discover the latest trends in fashion and electronics. Premium quality, unparalleled design.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 rounded-full px-8">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 rounded-full px-8">
                View Collections
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-24 container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
              <p className="text-muted-foreground mt-2">Handpicked essentials for your collection.</p>
            </div>
            <Link href="/products" className="text-primary hover:underline font-medium flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product) => (
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
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
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
        </section>
      </main>

      <footer className="bg-slate-950 text-slate-300 py-12 border-t border-slate-900">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-2xl font-bold tracking-tighter text-white">Luxe<span className="text-primary">Store</span></span>
            <p className="mt-4 text-sm text-slate-400">The premier destination for premium goods and fashion.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/sale" className="hover:text-white transition-colors">Sale</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-slate-400 mb-4">Subscribe for updates and exclusive offers.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email address" className="bg-slate-900 border-none rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary text-white" />
              <Button size="sm">Subscribe</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
