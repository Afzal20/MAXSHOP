import { fetchFromAPI } from "@/lib/api";
import { Category } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Layers } from "lucide-react";

export const revalidate = 60; // ISR

export default async function CategoriesPage() {
  let categories: Category[] = [];

  try {
    const categoriesRes = await fetchFromAPI("/shop/categories/");
    categories = categoriesRes.results || categoriesRes || [];
  } catch (error) {
    console.error("Failed to fetch categories", error);
  }

  // Fallback data if backend is empty
  if (categories.length === 0) {
    categories = [
      { id: 1, name: "Clothing", slug: "clothing", description: "Premium apparel for men and women." },
      { id: 2, name: "Accessories", slug: "accessories", description: "Complete your look with our fine accessories." },
      { id: 3, name: "Electronics", slug: "electronics", description: "Top-tier gadgets and tech." },
      { id: 4, name: "Footwear", slug: "footwear", description: "Step out in style and comfort." },
    ];
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-12 text-center mt-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">Shop by Category</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our carefully curated collections to find exactly what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {categories.map((category) => (
            <Card key={category.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white cursor-pointer rounded-3xl h-64 flex flex-col">
              <Link href={`/products?category=${category.slug}`} className="flex-grow relative flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-gray-50 -z-10 group-hover:scale-105 transition-transform duration-500" />
                
                {category.image ? (
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>
                ) : (
                  <div className="absolute inset-0 z-0 flex items-center justify-center opacity-5 group-hover:opacity-10 transition-opacity">
                    <Layers className="w-48 h-48" />
                  </div>
                )}
                
                <CardContent className="relative z-10 p-8 flex flex-col justify-end h-full">
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-muted-foreground mt-2 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="mt-4 text-sm font-semibold text-primary flex items-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Explore Collection &rarr;
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
